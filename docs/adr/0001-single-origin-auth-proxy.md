# Single-origin auth and API proxy via Next.js rewrites

Better Auth runs in Hono (`apps/api`) at `/api/auth/*` with direct database access, while Next.js (`apps/web`) rewrites `/api/:path*` to the Hono API server.

This gives the browser a single origin (`localhost:3000`), allowing standard HTTP-only `SameSite=Lax` session cookies without CORS configuration, third-party cookie restrictions, or cross-origin redirect complications during Google OAuth callbacks. Server components validate sessions by forwarding incoming cookie headers, while Hono protects write endpoints using a `requireAuth` middleware.
