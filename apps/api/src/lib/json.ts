import type { Context } from "hono"

export async function parseJsonBody(
  c: Context
): Promise<Record<string, unknown> | null> {
  try {
    const payload = await c.req.json()
    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {}
  } catch {
    return null
  }
}
