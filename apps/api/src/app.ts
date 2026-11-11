import { Hono } from "hono"
import { auth } from "./lib/auth.js"
import { requireAuth, optionalAuth } from "./middleware/auth.js"
import { academic } from "./routes/academic.js"
import { resources } from "./routes/resources.js"

export const app = new Hono()

// Mount Better Auth router
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

// Academic hierarchy (public reads)
app.route("/api", academic)

// Resource uploads (authenticated)
app.route("/api/resources", resources)

// Public root
app.get("/", (c) => {
  return c.text("Hello Hono!")
})

// Non-production test fixture endpoints
if (process.env.NODE_ENV !== "production") {
  // Protected mutation endpoint using requireAuth
  app.post("/api/test-protected", requireAuth, (c) => {
    const user = c.get("user")
    return c.json({
      success: true,
      studentId: user?.id,
    })
  })

  // Public read endpoint using optionalAuth
  app.get("/api/test-public", optionalAuth, (c) => {
    const user = c.get("user")
    return c.json({
      authenticated: !!user,
      student: user
        ? { id: user.id, email: user.email, name: user.name }
        : null,
    })
  })
}

export { requireAuth, optionalAuth }
