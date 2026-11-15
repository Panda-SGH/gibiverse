import test from "node:test"
import assert from "node:assert/strict"
import {
  calculateNextVote,
  buildSignInRedirectUrl,
  validateVotePayload,
} from "../components/vote-helpers.js"

test("calculateNextVote handles initial vote from neutral (null)", () => {
  // Neutral to upvote
  assert.deepStrictEqual(calculateNextVote(null, 1), {
    nextVote: 1,
    scoreDelta: 1,
  })

  // Neutral to downvote
  assert.deepStrictEqual(calculateNextVote(null, -1), {
    nextVote: -1,
    scoreDelta: -1,
  })
})

test("calculateNextVote handles toggle off by re-clicking active vote", () => {
  // Active upvote clicked again -> neutral
  assert.deepStrictEqual(calculateNextVote(1, 1), {
    nextVote: null,
    scoreDelta: -1,
  })

  // Active downvote clicked again -> neutral
  assert.deepStrictEqual(calculateNextVote(-1, -1), {
    nextVote: null,
    scoreDelta: 1,
  })
})

test("calculateNextVote handles switching vote direction", () => {
  // Upvote to downvote -> net delta -2
  assert.deepStrictEqual(calculateNextVote(1, -1), {
    nextVote: -1,
    scoreDelta: -2,
  })

  // Downvote to upvote -> net delta +2
  assert.deepStrictEqual(calculateNextVote(-1, 1), {
    nextVote: 1,
    scoreDelta: 2,
  })
})

test("buildSignInRedirectUrl properly formats sign-in redirect with callbackUrl", () => {
  assert.strictEqual(
    buildSignInRedirectUrl("/questions/123"),
    "/sign-in?callbackUrl=%2Fquestions%2F123"
  )
  assert.strictEqual(
    buildSignInRedirectUrl("/questions?sort=most_voted"),
    "/sign-in?callbackUrl=%2Fquestions%3Fsort%3Dmost_voted"
  )
})

test("validateVotePayload validates targetType, targetId, and value", () => {
  assert.strictEqual(
    validateVotePayload({ targetType: "question", targetId: "q_1", value: 1 })
      .valid,
    true
  )
  assert.strictEqual(
    validateVotePayload({ targetType: "answer", targetId: "a_1", value: -1 })
      .valid,
    true
  )

  // Invalid value
  assert.strictEqual(
    validateVotePayload({ targetType: "question", targetId: "q_1", value: 0 })
      .valid,
    false
  )
  assert.strictEqual(
    validateVotePayload({ targetType: "question", targetId: "q_1", value: 2 })
      .valid,
    false
  )

  // Invalid targetType
  assert.strictEqual(
    validateVotePayload({ targetType: "resource", targetId: "r_1", value: 1 })
      .valid,
    false
  )

  // Missing targetId
  assert.strictEqual(
    validateVotePayload({ targetType: "question", targetId: "", value: 1 })
      .valid,
    false
  )
})
