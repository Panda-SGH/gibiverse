"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Check, CheckCircle2, MessageCircle, ThumbsUp } from "lucide-react"
import { Badge } from "@gibiverse/ui/components/badge"
import { Button } from "@gibiverse/ui/components/button"
import { AnswerComposer } from "./answer-composer"
import { MarkdownRenderer } from "./markdown-renderer"
import {
  canAcceptAnswer,
  formatDetailDate,
  type AnswerItem,
  type QuestionDetail,
} from "@/lib/question-detail"
import { useSession } from "@/lib/auth-client"

interface QuestionDiscussionProps {
  initialQuestion: QuestionDetail
}

export function QuestionDiscussion({
  initialQuestion,
}: QuestionDiscussionProps) {
  const [question, setQuestion] = React.useState<QuestionDetail>(initialQuestion)
  const [acceptingId, setAcceptingId] = React.useState<string | null>(null)
  const [acceptError, setAcceptError] = React.useState<string | null>(null)

  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const isAuthor = canAcceptAnswer(question.studentId, currentUserId)

  async function handleToggleAccepted(answerId: string) {
    if (!isAuthor || acceptingId) return

    setAcceptingId(answerId)
    setAcceptError(null)

    // Toggle: if clicked answer is already accepted, unmark by sending null
    const targetPayloadId =
      question.acceptedAnswerId === answerId ? null : answerId

    try {
      const res = await fetch(`/api/questions/${encodeURIComponent(question.id)}/accept`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answerId: targetPayloadId }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || "Failed to update accepted answer.")
      }

      const updated = (await res.json()) as { acceptedAnswerId: string | null }

      setQuestion((prev) => ({
        ...prev,
        acceptedAnswerId: updated.acceptedAnswerId,
        answers: prev.answers.map((ans) => ({
          ...ans,
          isAccepted: ans.id === updated.acceptedAnswerId,
        })),
      }))
    } catch (err) {
      setAcceptError(
        err instanceof Error ? err.message : "Failed to update accepted status."
      )
    } finally {
      setAcceptingId(null)
    }
  }

  function handleAnswerSubmitted(newAnswer: AnswerItem) {
    setQuestion((prev) => ({
      ...prev,
      answerCount: prev.answerCount + 1,
      answers: [...prev.answers, { ...newAnswer, isAccepted: false }],
    }))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6"
        nativeButton={false}
        render={<Link href="/questions" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Back to questions
      </Button>

      {/* Question Main Card */}
      <article
        className="rounded-xl border bg-card p-6 shadow-xs sm:p-8"
        data-testid="question-main-article"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{question.courseCode}</Badge>
          <span className="text-xs text-muted-foreground">{question.courseName}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {question.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b pb-4">
          <span>
            Asked by <strong className="text-foreground">{question.studentName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={question.createdAt}>
            {formatDetailDate(question.createdAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="size-3.5" aria-hidden="true" />
            <span>{question.voteScore} votes</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" aria-hidden="true" />
            <span>{question.answerCount} answers</span>
          </span>
        </div>

        {/* Full Question Body */}
        <div className="mt-6" data-testid="question-body">
          <MarkdownRenderer content={question.body} />
        </div>
      </article>

      {/* Answers Section */}
      <section className="mt-10 space-y-6" aria-labelledby="answers-heading">
        <div className="flex items-center justify-between">
          <h2
            id="answers-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            {question.answers.length}{" "}
            {question.answers.length === 1 ? "Answer" : "Answers"}
          </h2>
        </div>

        {acceptError ? (
          <p className="text-xs font-medium text-destructive" role="alert">
            {acceptError}
          </p>
        ) : null}

        {/* Answers List in Chronological Order */}
        {question.answers.length === 0 ? (
          <div
            className="rounded-lg border border-dashed p-8 text-center"
            data-testid="no-answers-prompt"
          >
            <p className="text-sm font-medium text-foreground">
              No answers submitted yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to share an answer and help out fellow students.
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="answers-list">
            {question.answers.map((ans, idx) => {
              const isAccepted = ans.isAccepted || question.acceptedAnswerId === ans.id

              return (
                <article
                  key={ans.id}
                  id={`answer-${ans.id}`}
                  className={`rounded-lg border p-5 sm:p-6 transition-colors ${
                    isAccepted
                      ? "border-emerald-500/60 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs"
                      : "bg-card"
                  }`}
                  data-testid={`answer-card-${ans.id}`}
                  data-accepted={isAccepted ? "true" : "false"}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {ans.studentName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        answered {formatDetailDate(ans.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (#{idx + 1})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Distinctive Visual Accepted Badge */}
                      {isAccepted ? (
                        <Badge
                          className="bg-emerald-600 text-white hover:bg-emerald-600 gap-1"
                          data-testid={`accepted-badge-${ans.id}`}
                        >
                          <Check className="size-3" aria-hidden="true" />
                          Accepted Answer
                        </Badge>
                      ) : null}

                      {/* Author Accepted Answer Toggle Button */}
                      {isAuthor ? (
                        <Button
                          type="button"
                          variant={isAccepted ? "secondary" : "outline"}
                          size="xs"
                          disabled={acceptingId === ans.id}
                          onClick={() => handleToggleAccepted(ans.id)}
                          data-testid={`accept-button-${ans.id}`}
                          aria-label={
                            isAccepted
                              ? "Unmark accepted answer"
                              : "Mark as accepted answer"
                          }
                        >
                          <CheckCircle2
                            className={`size-3.5 ${
                              isAccepted ? "text-emerald-600" : "text-muted-foreground"
                            }`}
                            data-icon="inline-start"
                          />
                          {isAccepted ? "Unmark Accepted" : "Mark as Accepted"}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {/* Answer Body */}
                  <div className="mt-4 text-sm" data-testid={`answer-body-${ans.id}`}>
                    <MarkdownRenderer content={ans.body} />
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Post an Answer Section */}
        <div className="mt-12 space-y-3 pt-6 border-t">
          <h3 className="text-lg font-semibold text-foreground">
            Your Answer
          </h3>
          <AnswerComposer
            questionId={question.id}
            isAuthenticated={Boolean(session?.user)}
            onAnswerSubmitted={handleAnswerSubmitted}
          />
        </div>
      </section>
    </div>
  )
}
