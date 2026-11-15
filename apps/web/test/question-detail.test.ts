import test from "node:test"
import assert from "node:assert/strict"
import {
  canAcceptAnswer,
  isAnswerAccepted,
  validateAnswerSubmission,
} from "../app/questions/presentation.js"

test("canAcceptAnswer allows question author and rejects non-authors and guests", () => {
  // Author matches student
  assert.strictEqual(canAcceptAnswer("student_123", "student_123"), true)

  // Non-author student
  assert.strictEqual(canAcceptAnswer("student_123", "student_456"), false)

  // Unauthenticated guest
  assert.strictEqual(canAcceptAnswer("student_123", null), false)
  assert.strictEqual(canAcceptAnswer("student_123", undefined), false)
  assert.strictEqual(canAcceptAnswer(null, "student_123"), false)
})

test("isAnswerAccepted checks if answer matches acceptedAnswerId", () => {
  assert.strictEqual(isAnswerAccepted("ans_1", "ans_1"), true)
  assert.strictEqual(isAnswerAccepted("ans_1", "ans_2"), false)
  assert.strictEqual(isAnswerAccepted(null, "ans_1"), false)
  assert.strictEqual(isAnswerAccepted(undefined, "ans_1"), false)
})

test("validateAnswerSubmission enforces non-empty trimmed body", () => {
  const emptyRes = validateAnswerSubmission("   ")
  assert.strictEqual(emptyRes.valid, false)
  assert.match(emptyRes.error || "", /empty/i)

  const validRes = validateAnswerSubmission("Here is **step 1** of recursion.")
  assert.strictEqual(validRes.valid, true)
  assert.strictEqual(validRes.body, "Here is **step 1** of recursion.")
})
