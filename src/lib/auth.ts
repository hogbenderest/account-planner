import "server-only";
import { headers } from "next/headers";
import { env } from "cloudflare:workers";

/**
 * Single source of identity. The value is injected by the proxy (auth
 * middleware) after verifying the Cloudflare Access JWT (or, in dev builds
 * only, from DEV_USER_EMAIL). Nothing else may read identity from requests.
 */
export const OWNER_HEADER = "x-ap-owner";

export async function requireOwner(): Promise<string> {
  const h = await headers();
  const owner = h.get(OWNER_HEADER);
  if (!owner || owner === "") {
    throw new Error("Unauthenticated: owner header missing");
  }
  return owner;
}

/** Read a non-secret Worker var (Access config, dev identity). */
export function workerVar(name: string): string | undefined {
  return (env as unknown as Record<string, string | undefined>)[name];
}

export function isDevBuild(): boolean {
  return import.meta.env.DEV === true;
}
