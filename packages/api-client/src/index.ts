import { hcWithType } from "@gibiverse/api/hc"

/** Prefer same-origin in the browser so Next rewrites preserve session cookies. */
function resolveBaseUrl(baseUrl?: string) {
  if (baseUrl) return baseUrl
  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    const location = (globalThis as { location?: { origin?: string } }).location
    if (location?.origin) return location.origin
  }
  return process.env.API_URL || "http://localhost:8787"
}

export function createClient(baseUrl?: string) {
  return hcWithType(resolveBaseUrl(baseUrl))
}

export const client = createClient()

export type Client = ReturnType<typeof createClient>
