"use client"

import * as React from "react"
import { MessageCircle, ThumbsUp } from "lucide-react"
import { Badge } from "@gibiverse/ui/components/badge"
import { Button } from "@gibiverse/ui/components/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@gibiverse/ui/components/toggle-group"
import { CoursePicker } from "@/components/course-picker"
import type { Course, Department } from "@/lib/academic"
import {
  formatRelativeUploadDate,
  hasActiveQuestionFilters,
  listQuestions,
  questionCatalogEmptyState,
  type CatalogQuestion,
  type QuestionCatalogFilters,
  type QuestionSort,
} from "@/lib/question-catalog"

const SORT_OPTIONS: { value: QuestionSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "most_voted", label: "Most Voted" },
  { value: "unanswered", label: "Unanswered" },
]

export function QuestionCatalogClient({
  departments,
  courses,
  initialQuestions,
}: {
  departments: Department[]
  courses: Course[]
  initialQuestions: CatalogQuestion[]
}) {
  const [filters, setFilters] = React.useState<QuestionCatalogFilters>({
    courseId: null,
    departmentId: null,
    sort: "newest",
  })
  const [questions, setQuestions] =
    React.useState<CatalogQuestion[]>(initialQuestions)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const isFirstRender = React.useRef(true)

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    listQuestions(filters)
      .then((next) => {
        if (!cancelled) setQuestions(next)
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load questions. Please try again.")
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters])

  const emptyState = questionCatalogEmptyState(filters)

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4" aria-labelledby="filters-heading">
        <div>
          <h2
            id="filters-heading"
            className="text-lg font-semibold text-foreground"
          >
            Browse questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Sort by activity or filter by course.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Sort</p>
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={2}
            value={[filters.sort]}
            onValueChange={(next) => {
              const selected = next[0] as QuestionSort | undefined
              const match = SORT_OPTIONS.find(
                (option) => option.value === selected
              )
              if (!match) return
              setFilters((prev) => ({ ...prev, sort: match.value }))
            }}
            className="flex max-w-full flex-wrap"
            aria-label="Sort questions"
            data-testid="question-sort-filters"
          >
            {SORT_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <CoursePicker
          departments={departments}
          courses={courses}
          departmentId={filters.departmentId}
          courseId={filters.courseId}
          allowClear
          onDepartmentChange={(departmentId) =>
            setFilters((prev) => ({
              ...prev,
              departmentId,
              courseId: null,
            }))
          }
          onCourseChange={(courseId) =>
            setFilters((prev) => ({ ...prev, courseId }))
          }
        />
      </section>

      <section
        className="flex flex-col gap-4"
        aria-labelledby="catalog-heading"
        aria-busy={isLoading}
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="catalog-heading"
            className="text-lg font-semibold text-foreground"
          >
            Questions
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Updating…</p>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {questions.length === 0 ? (
          <div
            className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-6 py-10"
            data-testid="questions-empty-state"
          >
            <h3 className="text-base font-semibold text-foreground">
              {emptyState.title}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {emptyState.description}
            </p>
            {hasActiveQuestionFilters(filters) ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    courseId: null,
                    departmentId: null,
                  }))
                }
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            data-testid="questions-grid"
          >
            {questions.map((question) => (
              <li key={question.id}>
                <QuestionCard question={question} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function QuestionCard({ question }: { question: CatalogQuestion }) {
  return (
    <article
      className="flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-4"
      data-testid={`question-card-${question.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{question.courseCode}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ThumbsUp className="size-3.5" aria-hidden="true" />
          <span>{question.voteScore}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircle className="size-3.5" aria-hidden="true" />
          <span>{question.answerCount}</span>
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground">
        {question.title}
      </h3>
      <p className="line-clamp-2 text-sm text-muted-foreground">
        {question.body}
      </p>
      <p className="mt-auto text-sm text-muted-foreground">
        {question.studentName}
        <span aria-hidden="true"> · </span>
        <time dateTime={question.createdAt}>
          {formatRelativeUploadDate(question.createdAt)}
        </time>
      </p>
    </article>
  )
}
