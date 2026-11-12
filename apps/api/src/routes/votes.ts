import { randomUUID } from "node:crypto"
import { Hono, type Context } from "hono"
import { and, eq, sql } from "drizzle-orm"
import db from "../db/index.js"
import { question, answer } from "../db/schema/question.js"
import { vote } from "../db/schema/vote.js"
import { requireAuth } from "../middleware/auth.js"

const votes = new Hono()

async function parseJsonBody(
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

votes.post("/", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const targetType = raw.targetType
  const targetId = typeof raw.targetId === "string" ? raw.targetId.trim() : ""
  const value = raw.value

  if (targetType !== "question" && targetType !== "answer") {
    return c.json(
      { error: "targetType must be either 'question' or 'answer'" },
      400
    )
  }

  if (!targetId) {
    return c.json({ error: "targetId is required" }, 400)
  }

  if (value !== 1 && value !== -1) {
    return c.json({ error: "value must be 1 or -1" }, 400)
  }

  // Validate target existence
  if (targetType === "question") {
    const [existingQuestion] = await db
      .select({ id: question.id })
      .from(question)
      .where(eq(question.id, targetId))
      .limit(1)

    if (!existingQuestion) {
      return c.json({ error: "Question not found" }, 404)
    }
  } else {
    const [existingAnswer] = await db
      .select({ id: answer.id })
      .from(answer)
      .where(eq(answer.id, targetId))
      .limit(1)

    if (!existingAnswer) {
      return c.json({ error: "Answer not found" }, 404)
    }
  }

  // Atomically update vote and target score within a transaction
  const result = await db.transaction(async (tx) => {
    const [existingVote] = await tx
      .select({ id: vote.id, value: vote.value })
      .from(vote)
      .where(
        and(
          eq(vote.userId, user.id),
          eq(vote.targetType, targetType),
          eq(vote.targetId, targetId)
        )
      )
      .limit(1)

    let scoreDelta = 0
    let nextUserVote: number | null = null

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle off: remove vote record
        await tx.delete(vote).where(eq(vote.id, existingVote.id))
        scoreDelta = -value
        nextUserVote = null
      } else {
        // Switch direction
        await tx.update(vote).set({ value }).where(eq(vote.id, existingVote.id))
        scoreDelta = value - existingVote.value
        nextUserVote = value
      }
    } else {
      // New vote
      await tx.insert(vote).values({
        id: randomUUID(),
        userId: user.id,
        targetType,
        targetId,
        value,
      })
      scoreDelta = value
      nextUserVote = value
    }

    let updatedScore = 0
    if (targetType === "question") {
      const [updated] = await tx
        .update(question)
        .set({ voteScore: sql`${question.voteScore} + ${scoreDelta}` })
        .where(eq(question.id, targetId))
        .returning({ voteScore: question.voteScore })
      updatedScore = updated?.voteScore ?? 0
    } else {
      const [updated] = await tx
        .update(answer)
        .set({ voteScore: sql`${answer.voteScore} + ${scoreDelta}` })
        .where(eq(answer.id, targetId))
        .returning({ voteScore: answer.voteScore })
      updatedScore = updated?.voteScore ?? 0
    }

    return {
      score: updatedScore,
      userVote: nextUserVote,
      targetType,
      targetId,
    }
  })

  return c.json(result, 200)
})

export { votes }
