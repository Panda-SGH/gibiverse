import { z } from "zod"

/**
 * Vote target types supported by Gibiverse (Question or Answer).
 */
export const voteTargetTypeSchema = z.enum(["question", "answer"])
export type VoteTargetType = z.infer<typeof voteTargetTypeSchema>

/**
 * Directional vote value cast by a student (+1 for upvote, -1 for downvote).
 */
export const voteValueSchema = z.union([z.literal(1), z.literal(-1)])
export type VoteValue = z.infer<typeof voteValueSchema>

/**
 * Current student vote state: 1 (upvote), -1 (downvote), or null (no active vote).
 */
export const currentVoteSchema = z
  .union([z.literal(1), z.literal(-1)])
  .nullable()
export type CurrentVote = z.infer<typeof currentVoteSchema>

/**
 * Validated vote mutation payload received by the API.
 */
export const castVoteSchema = z.object({
  targetType: voteTargetTypeSchema,
  targetId: z.string().trim().min(1, "targetId is required"),
  value: voteValueSchema,
})
export type CastVotePayload = z.infer<typeof castVoteSchema>
