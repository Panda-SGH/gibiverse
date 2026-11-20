import "dotenv/config"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

const connectionString = process.env.DATABASE_URL

// Prefer DATABASE_URL when supplied. Without it, use TCP so local/CI tests
// can reach PostgreSQL services that are not exposed through this process's
// Unix socket directory.
export const pool = connectionString
  ? new pg.Pool({ connectionString })
  : new pg.Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || "gibiverse_admin",
      password: process.env.PGPASSWORD || "test",
      database: process.env.PGDATABASE || "gibiverse",
    })

const db = drizzle({ client: pool })

export default db
