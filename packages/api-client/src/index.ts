import { hcWithType } from "@gibiverse/api/hc"

export const client = hcWithType("http://localhost:8787")

export type Client = typeof client
