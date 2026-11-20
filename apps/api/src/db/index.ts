import "dotenv/config"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

const defaultConnectionString =
  "postgresql://postgres:test@localhost:5432/gibiverse"
const connectionString =
  process.env.DATABASE_URL ||
  (process.env.PGHOST ? undefined : defaultConnectionString)

// Connect via standard TCP connection string if provided and not using URL-encoded
// Unix sockets; otherwise fall back to explicit connection parameters.
export const pool =
  connectionString && !connectionString.includes("%2F")
    ? new pg.Pool({ connectionString })
    : new pg.Pool({
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "test",
        database: process.env.PGDATABASE || "gibiverse",
      })

const db = drizzle({ client: pool })

export default db
