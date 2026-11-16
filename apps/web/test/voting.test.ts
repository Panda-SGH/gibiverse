import test from "node:test"
import assert from "node:assert/strict"
import { calculateVoteTransition } from "@gibiverse/shared/utils"
import { buildSignInRedirectUrl } from "../components/vote-helpers.js"

test("calculateVoteTransition handles initial vote from neutral (null)", () => {
  // Neutral to upvote
  assert.deepStrictEqual(calculateVoteTransition(null, 1), {
    nextVote: 1,
    scoreDelta: 1,
  })

  // Neutral to downvote
  assert.deepStrictEqual(calculateVoteTransition(null, -1), {
    nextVote: -1,
    scoreDelta: -1,
  })
})

test("calculateVoteTransition handles toggle off by re-clicking active vote", () => {
  // Active upvote clicked again -> neutral
  assert.deepStrictEqual(calculateVoteTransition(1, 1), {
    nextVote: null,
    scoreDelta: -1,
  })

  // Active downvote clicked again -> neutral
  assert.deepStrictEqual(calculateVoteTransition(-1, -1), {
    nextVote: null,
    scoreDelta: 1,
  })
})

test("calculateVoteTransition handles switching vote direction", () => {
  // Upvote to downvote -> net delta -2
  assert.deepStrictEqual(calculateVoteTransition(1, -1), {
    nextVote: -1,
    scoreDelta: -2,
  })

  // Downvote to upvote -> net delta +2
  assert.deepStrictEqual(calculateVoteTransition(-1, 1), {
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
