"use client"

import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import {
  calculateNextVote,
  castVote,
  buildSignInRedirectUrl,
  type CurrentVote,
  type VoteTargetType,
} from "@/lib/voting"

export interface VoteControlsProps {
  targetType: VoteTargetType
  targetId: string
  initialScore: number
  initialUserVote?: number | null
  orientation?: "vertical" | "horizontal"
  size?: "sm" | "default"
  className?: string
  onVoteChange?: (score: number, userVote: CurrentVote) => void
}

function normalizeVote(v?: number | null): CurrentVote {
  if (v === 1) return 1
  if (v === -1) return -1
  return null
}

export function VoteControls({
  targetType,
  targetId,
  initialScore,
  initialUserVote = null,
  orientation = "vertical",
  size = "default",
  className = "",
  onVoteChange,
}: VoteControlsProps) {
  const [score, setScore] = React.useState<number>(initialScore)
  const [userVote, setUserVote] = React.useState<CurrentVote>(
    normalizeVote(initialUserVote)
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Keep internal state in sync if parent props change
  React.useEffect(() => {
    setScore(initialScore)
  }, [initialScore])

  React.useEffect(() => {
    setUserVote(normalizeVote(initialUserVote))
  }, [initialUserVote])

  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)

  async function handleVote(clickedValue: 1 | -1) {
    if (!isAuthenticated) {
      const currentPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/questions"
      window.location.href = buildSignInRedirectUrl(currentPath)
      return
    }

    if (isSubmitting) return

    const { nextVote, scoreDelta } = calculateNextVote(userVote, clickedValue)
    const prevScore = score
    const prevVote = userVote

    // Optimistic update
    const optimisticScore = score + scoreDelta
    setScore(optimisticScore)
    setUserVote(nextVote)
    onVoteChange?.(optimisticScore, nextVote)
    setIsSubmitting(true)

    try {
      const res = await castVote({
        targetType,
        targetId,
        value: clickedValue,
      })
      setScore(res.score)
      setUserVote(res.userVote)
      onVoteChange?.(res.score, res.userVote)
    } catch {
      // Revert optimistic update on failure
      setScore(prevScore)
      setUserVote(prevVote)
      onVoteChange?.(prevScore, prevVote)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isVertical = orientation === "vertical"
  const isSm = size === "sm"

  const buttonBaseClasses = isSm
    ? "size-7 rounded p-1 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    : "size-8 rounded-md p-1.5 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  const iconClasses = isSm ? "size-4" : "size-5"

  const upvoteClasses =
    userVote === 1
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"

  const downvoteClasses =
    userVote === -1
      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"

  const scoreColor =
    score > 0
      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
      : score < 0
        ? "text-rose-600 dark:text-rose-400 font-semibold"
        : "text-muted-foreground font-medium"

  return (
    <div
      className={`inline-flex items-center ${
        isVertical ? "flex-col gap-1" : "flex-row gap-1.5"
      } ${className}`}
      data-testid={`vote-controls-${targetId}`}
    >
      <button
        type="button"
        disabled={isSubmitting}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          handleVote(1)
        }}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        data-testid={`upvote-button-${targetId}`}
        className={`${buttonBaseClasses} ${upvoteClasses}`}
      >
        <ChevronUp className={iconClasses} aria-hidden="true" />
      </button>

      <span
        className={`text-xs tabular-nums select-none ${scoreColor}`}
        data-testid={`vote-score-${targetId}`}
      >
        {score}
      </span>

      <button
        type="button"
        disabled={isSubmitting}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          handleVote(-1)
        }}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        data-testid={`downvote-button-${targetId}`}
        className={`${buttonBaseClasses} ${downvoteClasses}`}
      >
        <ChevronDown className={iconClasses} aria-hidden="true" />
      </button>
    </div>
  )
}
