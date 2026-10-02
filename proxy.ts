import { NextResponse, type NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "cloudflare:workers";

/**
 * Cloudflare Access gate. Every request must carry a valid Access JWT
 * (iss = team domain, aud = this app's AUD tag) once past the Access
 * policy on accountplanner.ihogben.com. The verified identity is injected
 * as a request header that server components and actions read exclusively
 * through requireOwner(). The header is overwritten here, so a client
 * spoofing it never survives.
 *
 * Dev builds (import.meta.env.DEV is compile-time false in production)
 * skip verification and impersonate DEV_USER_EMAIL for local iteration.
 * There is deliberately no runtime bypass switch.
 */

const OWNER_HEADER = "x-ap-owner";

const vars = env as unknown as Record<string, string | undefined>;
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

export default async function proxy(req: NextRequest) {
  let owner: string | null = null;

  if (import.meta.env.DEV) {
    owner = import.meta.env.VITE_DEV_USER_EMAIL || "dev@example.com";
  } else {
    const team = vars.ACCESS_TEAM_DOMAIN;
    const aud = vars.ACCESS_APP_AUD;
    const token = req.headers.get("cf-access-jwt-assertion");
    if (!team || !aud) {
      return new Response("Auth misconfigured", { status: 500 });
    }
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }
    try {
      if (!jwksCache) {
        jwksCache = createRemoteJWKSet(new URL(`https://${team}/cdn-cgi/access/certs`));
      }
      const { payload } = await jwtVerify(token, jwksCache, {
        issuer: `https://${team}`,
        audience: aud,
      });
      owner = ((payload.email as string | undefined) ?? (payload.sub as string | undefined) ?? null)?.toLowerCase() ?? null;
    } catch {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  if (!owner || !/^[^@\s]+@[^@\s]+$/.test(owner)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const headers = new Headers(req.headers);
  headers.set(OWNER_HEADER, owner);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
