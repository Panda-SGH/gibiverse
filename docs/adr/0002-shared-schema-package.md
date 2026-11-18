# Extraction of @gibiverse/shared package for cross-workspace schemas

Domain schemas, Zod validators, and shared entity types are centralized in `@gibiverse/shared`, imported by both the Hono backend (`apps/api`) and the Next.js frontend (`apps/web`).

This guarantees that request payload validation, response contracts, and domain types remain identical across the boundary without code duplication or schema drift. Decoupling shared validation logic from `apps/api` ensures that `apps/web` can import schemas without pulling in server-only dependencies like Drizzle ORM, database drivers, or Node-specific libraries into the browser bundle.
