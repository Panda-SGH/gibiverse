import { randomUUID } from "node:crypto"
import { Hono } from "hono"
import { and, eq, sql } from "drizzle-orm"
import db from "../db/index.js"
import { question, answer } from "../db/schema/question.js"
import { vote } from "../db/schema/vote.js"
import { parseJsonBody } from "../lib/json.js"
import { requireAuth } from "../middleware/auth.js"

const votes = new Hono()

votes.post("/", requireAuth, async (c) => {
  const student = c.get("user")
  if (!student) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const targetType = raw.targetType
  const targetId =
    typeof raw.targetId === "string" ? raw.targetId.trim() : ""
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

  // Atomically lock target row, update vote, and recalculate aggregate score within a transaction
  const result = await db.transaction(async (tx) => {
    // 1. Lock target row to serialize concurrent votes and verify existence
    if (targetType === "question") {
      const [existingQuestion] = await tx
        .select({ id: question.id })
        .from(question)
        .where(eq(question.id, targetId))
        .for("update")

      if (!existingQuestion) {
        return { error: "Question not found", status: 404 as const }
      }
    } else {
      const [existingAnswer] = await tx
        .select({ id: answer.id })
        .from(answer)
        .where(eq(answer.id, targetId))
        .for("update")

      if (!existingAnswer) {
        return { error: "Answer not found", status: 404 as const }
      }
    }

    // 2. Query existing vote for this student & target (with row lock if present)
    const [existingVote] = await tx
      .select({ id: vote.id, value: vote.value })
      .from(vote)
      .where(
        and(
          eq(vote.userId, student.id),
          eq(vote.targetType, targetType),
          eq(vote.targetId, targetId)
        )
      )
      .for("update")

    let scoreDelta = 0
    let nextStudentVote: number | null = null

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle off: remove vote record
        await tx.delete(vote).where(eq(vote.id, existingVote.id))
        scoreDelta = -value
        nextStudentVote = null
      } else {
        // Switch direction
        await tx
          .update(vote)
          .set({ value })
          .where(eq(vote.id, existingVote.id))
        scoreDelta = value - existingVote.value
        nextStudentVote = value
      }
    } else {
      // New vote
      await tx.insert(vote).values({
        id: randomUUID(),
        userId: student.id,
        targetType,
        targetId,
        value,
      })
      scoreDelta = value
      nextStudentVote = value
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
      status: 200 as const,
      data: {
        score: updatedScore,
        studentVote: nextStudentVote,
        userVote: nextStudentVote,
        targetType,
        targetId,
      },
    }
  })

  if (result.status !== 200) {
    return c.json({ error: result.error }, result.status)
  }

  return c.json(result.data, 200)
})

export { votes }
