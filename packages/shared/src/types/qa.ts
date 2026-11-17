import { z } from "zod"

/**
 * Question sorting options supported by Gibiverse.
 */
export const QUESTION_SORT_OPTIONS = [
  "newest",
  "most_voted",
  "unanswered",
] as const

export const questionSortSchema = z.enum(QUESTION_SORT_OPTIONS)
export type QuestionSort = z.infer<typeof questionSortSchema>

/**
 * Validated question creation payload received by the API.
 */
export const askQuestionSchema = z.object({
  courseId: z.string().trim().min(1, "Course is required"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  body: z.string().trim().min(1, "Question body is required"),
})
export type AskQuestionPayload = z.infer<typeof askQuestionSchema>

/**
 * Validated answer submission payload received by the API.
 */
export const postAnswerSchema = z.object({
  body: z.string().trim().min(1, "Answer body cannot be empty"),
})
export type PostAnswerPayload = z.infer<typeof postAnswerSchema>

/**
 * Validated accept answer payload received by the API.
 */
export const acceptAnswerSchema = z.object({
  answerId: z
    .string()
    .trim()
    .min(1, "Answer ID must be valid")
    .nullable()
    .optional()
    .default(null),
})
export type AcceptAnswerPayload = z.infer<typeof acceptAnswerSchema>
