"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  BookOpen,
  MessageSquareQuote,
  MessageCircle,
  ThumbsUp,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@gibiverse/ui/components/badge"
import { Button } from "@gibiverse/ui/components/button"
import { Input } from "@gibiverse/ui/components/input"
import { client } from "@gibiverse/api-client"
import {
  formatAcademicPeriod,
  formatRelativeUploadDate,
} from "@/lib/formatters"
import {
  buildSearchPageUrl,
  getSearchEmptyState,
  type SearchResponse,
  type SearchResultQuestion,
  type SearchResultResource,
  type SearchType,
} from "./presentation"

interface SearchClientProps {
  initialQuery: string
  initialType: SearchType
  initialData: SearchResponse
}

export function SearchClient({
  initialQuery,
  initialType,
  initialData,
}: SearchClientProps) {
  const router = useRouter()
  const [queryInput, setQueryInput] = React.useState(initialQuery)
  const [activeTab, setActiveTab] = React.useState<SearchType>(initialType)
  const [results, setResults] = React.useState<SearchResponse>(initialData)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Sync state if props change (e.g. from navigation)
  React.useEffect(() => {
    setQueryInput(initialQuery)
    setActiveTab(initialType)
    setResults(initialData)
  }, [initialQuery, initialType, initialData])

  const executeSearch = async (query: string, type: SearchType) => {
    setIsLoading(true)
    setError(null)
    try {
      if (!query.trim()) {
        setResults({
          query: "",
          type,
          counts: { all: 0, resources: 0, questions: 0 },
          resources: [],
          questions: [],
        })
        return
      }
      const res = await client.api.search.$get({
        query: { q: query.trim(), type },
      })
      if (!res.ok) throw new Error("Search failed")
      const data = (await res.json()) as SearchResponse
      setResults(data)
    } catch {
      setError("Failed to fetch search results. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = queryInput.trim()
    router.replace(buildSearchPageUrl(trimmed, activeTab), { scroll: false })
    await executeSearch(trimmed, activeTab)
  }

  const handleTabChange = async (newTab: SearchType) => {
    setActiveTab(newTab)
    const trimmed = results.query.trim()
    router.replace(buildSearchPageUrl(trimmed, newTab), { scroll: false })

    if (trimmed) {
      await executeSearch(trimmed, newTab)
    }
  }

  const emptyState = getSearchEmptyState(results.query, activeTab)
  const hasNoResults =
    results.query.trim().length > 0 && results.counts.all === 0

  return (
    <div className="flex flex-col gap-8">
      {/* Search Input Bar */}
      <form
        action="/search"
        method="GET"
        onSubmit={handleSearchSubmit}
        role="search"
        className="relative flex w-full items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            name="q"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Search course materials, questions, course codes..."
            className="h-11 w-full rounded-lg pl-11 pr-4 text-base shadow-sm md:text-sm"
            aria-label="Search across platform"
            data-testid="search-page-input"
          />
        </div>
        <Button
          type="submit"
          className="h-11 px-6 font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav
          className="-mb-px flex gap-6"
          aria-label="Search results tabs"
        >
          <TabButton
            active={activeTab === "all"}
            onClick={() => handleTabChange("all")}
            label="All"
            count={results.counts.all}
            testId="tab-all"
          />
          <TabButton
            active={activeTab === "resources"}
            onClick={() => handleTabChange("resources")}
            label="Resources"
            count={results.counts.resources}
            testId="tab-resources"
          />
          <TabButton
            active={activeTab === "questions"}
            onClick={() => handleTabChange("questions")}
            label="Questions"
            count={results.counts.questions}
            testId="tab-questions"
          />
        </nav>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-border bg-muted/30"
            />
          ))}
        </div>
      )}

      {/* Results Content */}
      {!isLoading && (
        <>
          {/* Empty / Zero-Results State */}
          {!results.query.trim() || hasNoResults ? (
            <div
              className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center"
              data-testid="search-empty-state"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Search className="size-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {emptyState.title}
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {emptyState.description}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* "All" Tab: Shows both sections */}
              {activeTab === "all" && (
                <>
                  {results.resources.length > 0 && (
                    <section aria-labelledby="resources-section-heading">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="size-5 text-primary" />
                          <h2
                            id="resources-section-heading"
                            className="text-lg font-bold text-foreground"
                          >
                            Resources
                          </h2>
                          <Badge variant="secondary">
                            {results.counts.resources}
                          </Badge>
                        </div>
                        {results.counts.resources >
                          results.resources.length && (
                          <button
                            type="button"
                            onClick={() => handleTabChange("resources")}
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            View all resources
                            <ArrowRight className="size-4" />
                          </button>
                        )}
                      </div>
                      <ResourceGrid resources={results.resources} />
                    </section>
                  )}

                  {results.questions.length > 0 && (
                    <section aria-labelledby="questions-section-heading">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquareQuote className="size-5 text-primary" />
                          <h2
                            id="questions-section-heading"
                            className="text-lg font-bold text-foreground"
                          >
                            Questions
                          </h2>
                          <Badge variant="secondary">
                            {results.counts.questions}
                          </Badge>
                        </div>
                        {results.counts.questions >
                          results.questions.length && (
                          <button
                            type="button"
                            onClick={() => handleTabChange("questions")}
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            View all questions
                            <ArrowRight className="size-4" />
                          </button>
                        )}
                      </div>
                      <QuestionGrid questions={results.questions} />
                    </section>
                  )}
                </>
              )}

              {/* "Resources" Tab */}
              {activeTab === "resources" && (
                <section aria-labelledby="resources-tab-heading">
                  <h2 id="resources-tab-heading" className="sr-only">
                    Resource search results
                  </h2>
                  {results.resources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                      <h3 className="text-base font-semibold text-foreground">
                        No resources found
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {emptyState.description}
                      </p>
                    </div>
                  ) : (
                    <ResourceGrid resources={results.resources} />
                  )}
                </section>
              )}

              {/* "Questions" Tab */}
              {activeTab === "questions" && (
                <section aria-labelledby="questions-tab-heading">
                  <h2 id="questions-tab-heading" className="sr-only">
                    Question search results
                  </h2>
                  {results.questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                      <h3 className="text-base font-semibold text-foreground">
                        No questions found
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {emptyState.description}
                      </p>
                    </div>
                  ) : (
                    <QuestionGrid questions={results.questions} />
                  )}
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  count,
  testId,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  testId: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
      }`}
      data-testid={testId}
    >
      <span>{label}</span>
      <Badge
        variant={active ? "default" : "secondary"}
        className="rounded-full px-2 py-0.5 text-xs font-semibold"
      >
        {count}
      </Badge>
    </button>
  )
}

function ResourceGrid({ resources }: { resources: SearchResultResource[] }) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="search-resources-grid"
    >
      {resources.map((item) => (
        <li key={item.id}>
          <Link
            href={`/course-materials/${item.id}`}
            className="flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            data-testid={`search-resource-card-${item.id}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{item.courseCode}</Badge>
              <Badge variant="outline">{item.resourceType}</Badge>
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {item.title}
            </h3>
            {item.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            <p className="mt-auto text-sm text-muted-foreground">
              {formatAcademicPeriod(item.year, item.semester)}
              <span aria-hidden="true"> · </span>
              <time dateTime={item.createdAt}>
                {formatRelativeUploadDate(item.createdAt)}
              </time>
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function QuestionGrid({ questions }: { questions: SearchResultQuestion[] }) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      data-testid="search-questions-grid"
    >
      {questions.map((item) => (
        <li key={item.id}>
          <article
            className="flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/40"
            data-testid={`search-question-card-${item.id}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="secondary">{item.courseCode}</Badge>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="size-3.5" aria-hidden="true" />
                  <span>{item.voteScore}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  <span>{item.answerCount} answers</span>
                </span>
              </div>
            </div>
            <h3 className="text-base font-semibold text-foreground">
              <Link
                href={`/questions/${item.id}`}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.title}
              </Link>
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.body}
            </p>
            <p className="mt-auto text-sm text-muted-foreground">
              {item.studentName}
              <span aria-hidden="true"> · </span>
              <time dateTime={item.createdAt}>
                {formatRelativeUploadDate(item.createdAt)}
              </time>
            </p>
          </article>
        </li>
      ))}
    </ul>
  )
}
