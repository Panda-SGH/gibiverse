import { z } from "zod"

/**
 * Supported search domains/categories across Gibiverse.
 */
export const SEARCH_TYPES = ["all", "resources", "questions"] as const

/**
 * Schema validating the search category parameter.
 */
export const searchTypeSchema = z.enum(SEARCH_TYPES, {
  message: "Invalid search type",
})

export type SearchType = z.infer<typeof searchTypeSchema>

/**
 * Schema validating search query parameters at the route boundary.
 */
export const searchQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .transform((val) => val?.trim() ?? "")
    .default(""),
  type: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    searchTypeSchema.default("all")
  ),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>
