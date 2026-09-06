"use client";

import { useEffect, useState } from "react";

import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_ENDPOINT,
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_QUERY_PARAM,
} from "@/lib/constants";
import type { TrackedMedia } from "@/lib/media/tracking";
import type { SearchResponse } from "@/lib/search/response";

export type SearchStatus = "idle" | "loading" | "ready" | "error";

const NO_ITEMS: TrackedMedia[] = [];

function endpointFor(term: string): string {
  const params = new URLSearchParams({ [SEARCH_QUERY_PARAM]: term });

  return `${SEARCH_ENDPOINT}?${params}`;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TrackedMedia[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");

  const term = query.trim();

  useEffect(() => {
    if (term.length < SEARCH_MIN_QUERY_LENGTH) {
      setItems(NO_ITEMS);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(endpointFor(term), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search responded ${response.status}`);
        }

        const body = (await response.json()) as SearchResponse;

        setItems(body.items);
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(error);
        setItems(NO_ITEMS);
        setStatus("error");
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  return { query, setQuery, term, items, status };
}
