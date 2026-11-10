import type { MiddlewareHandler } from "hono"
import { auth } from "../lib/auth.js"

export type AuthUser = typeof auth.$Infer.Session.user
export type AuthSession = typeof auth.$Infer.Session.session

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser | null
    session: AuthSession | null
  }
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  c.set("user", session.user)
  c.set("session", session.session)
  return next()
}

export const optionalAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (session) {
    c.set("user", session.user)
    c.set("session", session.session)
  } else {
    c.set("user", null)
    c.set("session", null)
  }

  return next()
}
