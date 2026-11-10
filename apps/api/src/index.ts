import dns from "node:dns"
import { serve } from "@hono/node-server"
import { app } from "./app.js"

// Prioritize IPv4 to avoid ETIMEDOUT errors on networks with unreachable IPv6 routes
dns.setDefaultResultOrder("ipv4first")

const port = Number(process.env.PORT) || 8787

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)

export { app }
