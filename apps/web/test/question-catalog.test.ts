import test from "node:test"
import assert from "node:assert/strict"
import {
  buildQuestionsQuery,
  hasActiveQuestionFilters,
  questionCatalogEmptyState,
} from "../app/questions/presentation.js"

test("buildQuestionsQuery includes course and non-default sort", () => {
  assert.strictEqual(
    buildQuestionsQuery({
      courseId: null,
      universityId: null,
      sort: "newest",
    }),
    "/api/questions"
  )
  assert.strictEqual(
    buildQuestionsQuery({
      courseId: "course_1",
      universityId: "uni_1",
      sort: "most_voted",
    }),
    "/api/questions?courseId=course_1&universityId=uni_1&sort=most_voted"
  )
})

test("questionCatalogEmptyState distinguishes filtered vs empty catalog", () => {
  assert.deepStrictEqual(
    questionCatalogEmptyState({
      courseId: null,
      universityId: null,
      sort: "newest",
    }),
    {
      title: "No questions yet",
      description:
        "Be the first to ask an academic question for your courses.",
    }
  )
  assert.ok(
    hasActiveQuestionFilters({
      courseId: "course_1",
      universityId: null,
      sort: "newest",
    })
  )
  assert.match(
    questionCatalogEmptyState({
      courseId: "course_1",
      universityId: null,
      sort: "newest",
    }).title,
    /match/i
  )
})
