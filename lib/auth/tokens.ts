import { createHash, randomBytes } from "node:crypto";

import { SESSION_TOKEN_BYTES } from "@/lib/constants";

export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
