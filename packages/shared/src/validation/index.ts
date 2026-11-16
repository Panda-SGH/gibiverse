import { z } from "zod"

/**
 * Shared validation schemas foundation for Gibiverse.
 */
export const semesterSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal("summer"),
])

export const academicPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  semester: semesterSchema,
})
