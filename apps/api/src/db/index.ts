import "dotenv/config"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

const connectionString = process.env.DATABASE_URL

// Prefer the standard PostgreSQL URL when supplied.  Use explicit Unix socket
// parameters only for an actual URL-encoded Unix socket URL.
export const pool =
  connectionString && !connectionString.includes("%2F")
    ? new pg.Pool({ connectionString })
    : new pg.Pool({
        host: process.env.PGHOST || "/tmp",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "gibiverse_admin",
        database: process.env.PGDATABASE || "gibiverse",
      })

const db = drizzle({ client: pool })

export default db
