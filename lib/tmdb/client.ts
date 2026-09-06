import "server-only";

import {
  TMDB_CONCURRENCY,
  TMDB_MAX_ATTEMPTS,
  TMDB_RETRY_BASE_DELAY_MS,
  TMDB_RETRY_JITTER,
  TMDB_RETRY_MAX_DELAY_MS,
} from "@/lib/constants";

export type TmdbFetchOptions = {
  params?: Record<string, string | number | boolean>;
  revalidate?: number;
  tags?: string[];
  attempts?: number;
};

export class TmdbError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(`TMDB ${path} — ${message}`, options);
    this.name = "TmdbError";
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

function config() {
  const rawTimeout = required("TMDB_TIMEOUT_MS");
  const timeoutMs = Number(rawTimeout);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error(
      `TMDB_TIMEOUT_MS must be a positive number of milliseconds, got "${rawTimeout}".`,
    );
  }

  return {
    token: required("TMDB_READ_TOKEN"),
    base: required("TMDB_API_BASE").replace(/\/+$/, ""),
    timeoutMs,
  };
}

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function backoffMs(attempt: number, retryAfter: string | null): number {
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.min(seconds * 1000, TMDB_RETRY_MAX_DELAY_MS);
  }
  const ceiling = Math.min(
    TMDB_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
    TMDB_RETRY_MAX_DELAY_MS,
  );
  return ceiling * (TMDB_RETRY_JITTER + Math.random() * (1 - TMDB_RETRY_JITTER));
}

let active = 0;
const waiting: (() => void)[] = [];

function acquire(): Promise<void> {
  if (active < TMDB_CONCURRENCY) {
    active += 1;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    waiting.push(() => {
      active += 1;
      resolve();
    });
  });
}

function release(): void {
  active -= 1;
  waiting.shift()?.();
}

async function send(
  url: URL,
  token: string,
  timeoutMs: number,
  next: { revalidate?: number; tags?: string[] },
): Promise<Response> {
  await acquire();
  try {
    return await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      next,
    });
  } finally {
    release();
  }
}

async function failureMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { status_message?: string };
    if (body.status_message) return body.status_message;
  } catch {
  }
  return response.statusText || "Unknown error";
}

export async function tmdbFetch<T>(
  path: string,
  options: TmdbFetchOptions = {},
): Promise<T> {
  if (!path.startsWith("/")) {
    throw new Error(`TMDB path must start with "/", got "${path}".`);
  }

  const { token, base, timeoutMs } = config();

  const url = new URL(base + path);
  for (const [key, value] of Object.entries(options.params ?? {})) {
    url.searchParams.set(key, String(value));
  }

  const attempts = Math.max(1, options.attempts ?? TMDB_MAX_ATTEMPTS);

  for (let attempt = 1; ; attempt++) {
    const lastAttempt = attempt === attempts;

    let response: Response;
    try {
      response = await send(url, token, timeoutMs, {
        revalidate: options.revalidate,
        tags: options.tags,
      });
    } catch (cause) {
      const timedOut = cause instanceof Error && cause.name === "TimeoutError";
      if (lastAttempt) {
        throw new TmdbError(
          0,
          path,
          timedOut
            ? `request timed out after ${timeoutMs}ms (${attempts} attempts)`
            : `request failed (${attempts} attempts)`,
          { cause },
        );
      }
      await sleep(backoffMs(attempt, null));
      continue;
    }

    if (response.ok) return (await response.json()) as T;

    if (lastAttempt || !RETRYABLE_STATUSES.has(response.status)) {
      throw new TmdbError(response.status, path, await failureMessage(response));
    }

    await sleep(backoffMs(attempt, response.headers.get("retry-after")));
  }
}
