import test from "node:test"
import assert from "node:assert/strict"
import {
  questionSortSchema,
  askQuestionSchema,
  postAnswerSchema,
  acceptAnswerSchema,
} from "@gibiverse/shared/types"

test("questionSortSchema validates allowed sort options and rejects invalid", () => {
  assert.equal(questionSortSchema.safeParse("newest").success, true)
  assert.equal(questionSortSchema.safeParse("most_voted").success, true)
  assert.equal(questionSortSchema.safeParse("unanswered").success, true)

  assert.equal(questionSortSchema.safeParse("popular").success, false)
  assert.equal(questionSortSchema.safeParse("").success, false)
  assert.equal(questionSortSchema.safeParse(null).success, false)
})

test("askQuestionSchema validates complete payload and trims fields", () => {
  const result = askQuestionSchema.safeParse({
    title: "  How do I solve recursion?  ",
    body: "  Stuck on base case.  ",
    courseId: "  course-123  ",
  })
  assert.equal(result.success, true)
  if (result.success) {
    assert.deepEqual(result.data, {
      title: "How do I solve recursion?",
      body: "Stuck on base case.",
      courseId: "course-123",
    })
  }
})

test("askQuestionSchema rejects empty or missing required fields", () => {
  assert.equal(
    askQuestionSchema.safeParse({
      title: "   ",
      body: "Some body",
      courseId: "course-123",
    }).success,
    false
  )
  assert.equal(
    askQuestionSchema.safeParse({
      title: "Valid Title",
      body: "   ",
      courseId: "course-123",
    }).success,
    false
  )
  assert.equal(
    askQuestionSchema.safeParse({
      title: "Valid Title",
      body: "Valid body",
      courseId: "",
    }).success,
    false
  )
})

test("askQuestionSchema rejects title exceeding 200 characters", () => {
  const longTitle = "a".repeat(201)
  const result = askQuestionSchema.safeParse({
    title: longTitle,
    body: "Valid body",
    courseId: "course-123",
  })
  assert.equal(result.success, false)
})

test("postAnswerSchema validates non-empty answer body and trims", () => {
  const result = postAnswerSchema.safeParse({
    body: "  Here is the answer.  ",
  })
  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.body, "Here is the answer.")
  }

  assert.equal(postAnswerSchema.safeParse({ body: "" }).success, false)
  assert.equal(postAnswerSchema.safeParse({ body: "   " }).success, false)
})

test("acceptAnswerSchema validates answerId, null, or optional", () => {
  const validString = acceptAnswerSchema.safeParse({ answerId: "ans-456" })
  assert.equal(validString.success, true)
  if (validString.success) {
    assert.equal(validString.data.answerId, "ans-456")
  }

  const validNull = acceptAnswerSchema.safeParse({ answerId: null })
  assert.equal(validNull.success, true)
  if (validNull.success) {
    assert.equal(validNull.data.answerId, null)
  }

  const validEmpty = acceptAnswerSchema.safeParse({})
  assert.equal(validEmpty.success, true)

  // Empty string or whitespace-only is rejected
  assert.equal(acceptAnswerSchema.safeParse({ answerId: "  " }).success, false)
  assert.equal(acceptAnswerSchema.safeParse({ answerId: 123 }).success, false)
})
