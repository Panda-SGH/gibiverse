import test from "node:test"
import assert from "node:assert/strict"
import {
  voteTargetTypeSchema,
  voteValueSchema,
  currentVoteSchema,
  castVoteSchema,
} from "../src/types/index.js"
import {
  calculateVoteTransition,
  type VoteTransition,
} from "../src/utils/index.js"

test("voteTargetTypeSchema validates question and answer, rejects invalid strings", () => {
  assert.equal(voteTargetTypeSchema.safeParse("question").success, true)
  assert.equal(voteTargetTypeSchema.safeParse("answer").success, true)
  assert.equal(voteTargetTypeSchema.safeParse("resource").success, false)
  assert.equal(voteTargetTypeSchema.safeParse("").success, false)
  assert.equal(voteTargetTypeSchema.safeParse(null).success, false)
})

test("voteValueSchema validates 1 and -1, rejects other values", () => {
  assert.equal(voteValueSchema.safeParse(1).success, true)
  assert.equal(voteValueSchema.safeParse(-1).success, true)
  assert.equal(voteValueSchema.safeParse(0).success, false)
  assert.equal(voteValueSchema.safeParse(2).success, false)
  assert.equal(voteValueSchema.safeParse("1").success, false)
})

test("currentVoteSchema validates 1, -1, and null", () => {
  assert.equal(currentVoteSchema.safeParse(1).success, true)
  assert.equal(currentVoteSchema.safeParse(-1).success, true)
  assert.equal(currentVoteSchema.safeParse(null).success, true)
  assert.equal(currentVoteSchema.safeParse(0).success, false)
  assert.equal(currentVoteSchema.safeParse(undefined).success, false)
})

test("castVoteSchema validates vote payload at route boundary", () => {
  const validPayload = {
    targetType: "question",
    targetId: "question-uuid-123",
    value: 1,
  }
  const result = castVoteSchema.safeParse(validPayload)
  assert.equal(result.success, true)
  if (result.success) {
    assert.deepEqual(result.data, validPayload)
  }

  // Missing or whitespace targetId is rejected
  assert.equal(
    castVoteSchema.safeParse({ targetType: "question", targetId: "", value: 1 })
      .success,
    false
  )
  assert.equal(
    castVoteSchema.safeParse({
      targetType: "question",
      targetId: "   ",
      value: 1,
    }).success,
    false
  )

  // Invalid targetType
  assert.equal(
    castVoteSchema.safeParse({
      targetType: "comment",
      targetId: "abc",
      value: 1,
    }).success,
    false
  )

  // Invalid value
  assert.equal(
    castVoteSchema.safeParse({
      targetType: "answer",
      targetId: "abc",
      value: 0,
    }).success,
    false
  )
})

test("calculateVoteTransition calculates transition from neutral (null)", () => {
  const upTransition: VoteTransition = calculateVoteTransition(null, 1)
  assert.deepEqual(upTransition, {
    nextVote: 1,
    scoreDelta: 1,
  })

  const downTransition: VoteTransition = calculateVoteTransition(null, -1)
  assert.deepEqual(downTransition, {
    nextVote: -1,
    scoreDelta: -1,
  })
})

test("calculateVoteTransition calculates toggle off when re-clicking active vote", () => {
  const upToNeutral: VoteTransition = calculateVoteTransition(1, 1)
  assert.deepEqual(upToNeutral, {
    nextVote: null,
    scoreDelta: -1,
  })

  const downToNeutral: VoteTransition = calculateVoteTransition(-1, -1)
  assert.deepEqual(downToNeutral, {
    nextVote: null,
    scoreDelta: 1,
  })
})

test("calculateVoteTransition calculates direction switch with net delta of 2", () => {
  const upToDown: VoteTransition = calculateVoteTransition(1, -1)
  assert.deepEqual(upToDown, {
    nextVote: -1,
    scoreDelta: -2,
  })

  const downToUp: VoteTransition = calculateVoteTransition(-1, 1)
  assert.deepEqual(downToUp, {
    nextVote: 1,
    scoreDelta: 2,
  })
})
