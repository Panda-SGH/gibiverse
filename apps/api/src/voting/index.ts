import { randomUUID } from "node:crypto"
import { and, eq, sql } from "drizzle-orm"
import {
  type VoteTargetType,
  type VoteValue,
  type CurrentVote,
  voteTargetTypeSchema,
  voteValueSchema,
} from "@gibiverse/shared/types"
import {
  calculateVoteTransition,
  type VoteTransition,
} from "@gibiverse/shared/utils"
import { question, answer } from "../db/schema/question.js"
import { vote } from "../db/schema/vote.js"
import {
  ok,
  err,
  type Db,
  type Result,
  type DomainError,
} from "../lib/result.js"

export type { DomainError as VotingError }
export type VotingResult<T> = Result<T>

export type { VoteTargetType, VoteValue, CurrentVote, VoteTransition }
export { calculateVoteTransition }

export type UserIdentity = {
  id: string
  name?: string
}

export type CastVoteInput = {
  user: UserIdentity
  targetType: unknown
  targetId: unknown
  value: unknown
}

export type VoteResult = {
  score: number
  userVote: CurrentVote
  targetType: VoteTargetType
  targetId: string
}

const TARGET_CONFIG = {
  question: {
    table: question,
    notFoundMessage: "Question not found",
  },
  answer: {
    table: answer,
    notFoundMessage: "Answer not found",
  },
} as const

export function createVoting(deps: { db: Db }) {
  const { db } = deps

  async function cast(input: CastVoteInput): Promise<VotingResult<VoteResult>> {
    const { user, targetType, targetId, value } = input

    if (!user || !user.id) {
      return err("validation", "User is required")
    }

    const parsedTargetType = voteTargetTypeSchema.safeParse(targetType)
    if (!parsedTargetType.success) {
      return err(
        "validation",
        "targetType must be either 'question' or 'answer'"
      )
    }

    const trimmedTargetId = typeof targetId === "string" ? targetId.trim() : ""

    if (!trimmedTargetId) {
      return err("validation", "targetId is required")
    }

    const parsedValue = voteValueSchema.safeParse(value)
    if (!parsedValue.success) {
      return err("validation", "value must be 1 or -1")
    }

    const validTargetType = parsedTargetType.data
    const validValue = parsedValue.data
    const config = TARGET_CONFIG[validTargetType]

    return await db.transaction(async (tx) => {
      // 1. Lock target row to serialize concurrent votes and verify existence
      const [existingTarget] = await tx
        .select({ id: config.table.id })
        .from(config.table)
        .where(eq(config.table.id, trimmedTargetId))
        .for("update")

      if (!existingTarget) {
        return err("not_found", config.notFoundMessage)
      }

      // 2. Query existing vote for this user & target (with row lock)
      const [existingVote] = await tx
        .select({ id: vote.id, value: vote.value })
        .from(vote)
        .where(
          and(
            eq(vote.userId, user.id),
            eq(vote.targetType, validTargetType),
            eq(vote.targetId, trimmedTargetId)
          )
        )
        .for("update")

      const currentVoteValue: CurrentVote = existingVote
        ? (existingVote.value as VoteValue)
        : null

      const { nextVote, scoreDelta } = calculateVoteTransition(
        currentVoteValue,
        validValue
      )

      if (existingVote) {
        if (nextVote === null) {
          // Toggle off
          await tx.delete(vote).where(eq(vote.id, existingVote.id))
        } else {
          // Switch direction
          await tx
            .update(vote)
            .set({ value: nextVote })
            .where(eq(vote.id, existingVote.id))
        }
      } else {
        // New vote
        await tx.insert(vote).values({
          id: randomUUID(),
          userId: user.id,
          targetType: validTargetType,
          targetId: trimmedTargetId,
          value: nextVote!,
        })
      }

      // 3. Atomically update target score
      const [updated] = await tx
        .update(config.table)
        .set({ voteScore: sql`${config.table.voteScore} + ${scoreDelta}` })
        .where(eq(config.table.id, trimmedTargetId))
        .returning({ voteScore: config.table.voteScore })

      return ok({
        score: updated?.voteScore ?? 0,
        userVote: nextVote,
        targetType: validTargetType,
        targetId: trimmedTargetId,
      })
    })
  }

  return {
    cast,
  }
}

export type Voting = ReturnType<typeof createVoting>
