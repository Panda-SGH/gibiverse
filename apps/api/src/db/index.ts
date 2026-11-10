import "dotenv/config"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

const connectionString = process.env.DATABASE_URL

// Connect via standard TCP connection string if provided and not using URL-encoded Unix sockets,
// otherwise fall back to explicit Unix domain socket parameters for local trust authentication.
export const pool =
  connectionString && !connectionString.includes("%2F")
    ? new pg.Pool({ connectionString })
    : new pg.Pool({
        host: process.env.PGHOST || "/tmp",
        port: Number(process.env.PGPORT) || 5433,
        user: process.env.PGUSER || "gibiverse_admin",
        database: process.env.PGDATABASE || "gibiverse",
      })

const db = drizzle({ client: pool })

export default db
