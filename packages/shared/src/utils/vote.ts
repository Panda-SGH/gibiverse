import type { CurrentVote, VoteValue } from "../types/index.js"

export type VoteTransition = {
  nextVote: CurrentVote
  scoreDelta: number
}

/**
 * Pure transition logic for voting:
 * - Fresh vote: returns incoming vote and delta (+1 or -1).
 * - Toggle off: clicking the same active vote removes it (null) with delta (-incoming).
 * - Switch: clicking opposite vote reverses direction with delta (±2).
 */
export function calculateVoteTransition(
  currentVote: CurrentVote,
  incomingVote: VoteValue
): VoteTransition {
  if (currentVote === incomingVote) {
    return {
      nextVote: null,
      scoreDelta: -incomingVote,
    }
  }

  if (currentVote === null) {
    return {
      nextVote: incomingVote,
      scoreDelta: incomingVote,
    }
  }

  return {
    nextVote: incomingVote,
    scoreDelta: incomingVote - currentVote,
  }
}
