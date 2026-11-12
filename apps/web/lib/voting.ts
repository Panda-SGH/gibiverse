export type VoteTargetType = "question" | "answer"
export type VoteValue = 1 | -1
export type CurrentVote = 1 | -1 | null

export interface VoteTransitionResult {
  nextVote: CurrentVote
  scoreDelta: number
}

export interface VotePayload {
  targetType: VoteTargetType
  targetId: string
  value: VoteValue
}

export interface VoteResponse {
  score: number
  userVote: CurrentVote
  targetType: VoteTargetType
  targetId: string
}

/**
 * Calculates the next active vote state and the optimistic delta to the vote score.
 * - Re-clicking the active vote toggles it off (returns null).
 * - Clicking the opposite vote switches direction (delta ±2).
 * - Clicking from neutral adds the vote (delta ±1).
 */
export function calculateNextVote(
  currentVote: CurrentVote,
  incomingVote: VoteValue
): VoteTransitionResult {
  if (currentVote === incomingVote) {
    // Toggle off
    return {
      nextVote: null,
      scoreDelta: -incomingVote,
    }
  }

  if (currentVote === null) {
    // Fresh vote
    return {
      nextVote: incomingVote,
      scoreDelta: incomingVote,
    }
  }

  // Switch direction (e.g. +1 -> -1 or -1 -> +1)
  return {
    nextVote: incomingVote,
    scoreDelta: incomingVote - currentVote,
  }
}

/**
 * Generates the redirect URL to sign in, preserving the current page as callbackUrl.
 */
export function buildSignInRedirectUrl(currentPath: string): string {
  const encoded = encodeURIComponent(currentPath)
  return `/sign-in?callbackUrl=${encoded}`
}

/**
 * Validates a voting request payload.
 */
export function validateVotePayload(payload: unknown): {
  valid: boolean
  error?: string
  data?: VotePayload
} {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Invalid payload" }
  }

  const p = payload as Record<string, unknown>

  if (p.targetType !== "question" && p.targetType !== "answer") {
    return { valid: false, error: "targetType must be 'question' or 'answer'" }
  }

  if (typeof p.targetId !== "string" || !p.targetId.trim()) {
    return { valid: false, error: "targetId is required" }
  }

  if (p.value !== 1 && p.value !== -1) {
    return { valid: false, error: "value must be 1 or -1" }
  }

  return {
    valid: true,
    data: {
      targetType: p.targetType,
      targetId: p.targetId.trim(),
      value: p.value,
    },
  }
}

/**
 * Client-side helper to post a vote to the API.
 */
export async function castVote(payload: VotePayload): Promise<VoteResponse> {
  const res = await fetch("/api/votes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(errorData?.error || "Failed to submit vote")
  }

  return (await res.json()) as VoteResponse
}
