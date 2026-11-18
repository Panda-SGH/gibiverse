# Typed RPC client via @gibiverse/api-client and Hono hc

Ad-hoc `fetch` wrappers scattered across `apps/web/lib` are unified under the `@gibiverse/api-client` package, built on Hono's `hc` RPC client that binds directly to the API type definitions.

This provides end-to-end type safety for route URLs, URL path parameters, request JSON bodies, and responses in Next.js pages and components. Type mismatches and route deprecations are caught at compile time during `pnpm typecheck` rather than failing silently at runtime, eliminating the need for manual endpoint typings or intermediate OpenAPI code-generation build steps.
