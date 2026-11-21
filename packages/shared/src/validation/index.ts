import { z } from "zod"
import { semesterSchema } from "../types/course-material.js"

/**
 * Shared validation schemas foundation for Gibiverse.
 */
export const academicPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  semester: semesterSchema,
})

export * from "../types/vote.js"
export * from "../types/qa.js"
export * from "../types/search.js"
export * from "../types/course-material.js"
export * from "./course-material.js"
