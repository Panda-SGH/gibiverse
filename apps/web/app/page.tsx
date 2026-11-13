import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MessageSquareQuote,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@gibiverse/ui/components/badge"
import { Button } from "@gibiverse/ui/components/button"
import {
  fetchPlatformOverview,
  formatActivityCounter,
  getRecentQuestionsEmptyState,
  getRecentResourcesEmptyState,
} from "@/lib/overview"
import {
  formatAcademicPeriod,
  formatRelativeUploadDate,
} from "@/lib/resource-catalog"

const TYPE_PILL_LABELS: Record<string, string> = {
  exam: "Exam",
  notes: "Notes",
  slides: "Slides",
  assignment: "Assignment",
  lab: "Lab",
  other: "Other",
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const overview = await fetchPlatformOverview()
  const recentResourcesEmpty = getRecentResourcesEmptyState()
  const recentQuestionsEmpty = getRecentQuestionsEmptyState()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="space-y-12 sm:space-y-16">
        {/* Hero Section: Welcoming university community overview */}
        <section
          aria-labelledby="overview-heading"
          className="mx-auto flex max-w-3xl flex-col items-center space-y-6 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>University Academic Hub</span>
          </div>

          <h1
            id="overview-heading"
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Academic Resource Sharing &amp; Course Q&amp;A
          </h1>

          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Gibiverse connects students to course resources, past exams, lecture
            notes, and peer-driven academic Q&amp;A across departments.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 sm:gap-4">
            <Link href="/resources">
              <Button size="lg" className="gap-2">
                <BookOpen className="size-4" />
                <span>Browse Resources</span>
              </Button>
            </Link>
            <Link href="/questions">
              <Button variant="outline" size="lg" className="gap-2">
                <MessageSquareQuote className="size-4" />
                <span>Ask Questions</span>
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="ghost" size="lg" className="gap-2">
                <Search className="size-4" />
                <span>Search Catalog</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Platform Activity Counters */}
        <section
          aria-labelledby="platform-stats-heading"
          className="space-y-4"
        >
          <h2 id="platform-stats-heading" className="sr-only">
            Platform Activity Statistics
          </h2>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            data-testid="platform-stats-grid"
          >
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formatActivityCounter(overview.stats.totalResources)}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Resources
                </p>
                <p className="text-xs text-muted-foreground/80 truncate">
                  Past exams, lecture notes &amp; slides
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquareQuote className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formatActivityCounter(overview.stats.totalQuestions)}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Academic Questions
                </p>
                <p className="text-xs text-muted-foreground/80 truncate">
                  Course discussions &amp; peer help
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {formatActivityCounter(overview.stats.activeCourses)}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </p>
                <p className="text-xs text-muted-foreground/80 truncate">
                  Courses with resources &amp; Q&amp;A
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation Shortcut Cards */}
        <section
          aria-labelledby="shortcuts-heading"
          className="space-y-4"
        >
          <div className="flex flex-col gap-1">
            <h2
              id="shortcuts-heading"
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              Quick Shortcuts
            </h2>
            <p className="text-sm text-muted-foreground">
              Jump directly into course resources, peer discussions, or search.
            </p>
          </div>

          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            data-testid="shortcut-cards-grid"
          >
            <Link
              href="/resources"
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="shortcut-card-resources"
            >
              <div className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <BookOpen className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Course Resources
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore past exams, lecture notes, assignments, and slides
                  organized by academic period and department.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
                <span>Browse Resources</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/questions"
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="shortcut-card-questions"
            >
              <div className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <MessageSquareQuote className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Course Q&amp;A
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ask academic queries, get answers from classmates, vote on
                  solutions, and discuss coursework.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
                <span>Join Discussions</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/search"
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="shortcut-card-search"
            >
              <div className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Search className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Unified Search
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quickly find course materials, past questions, and discussions
                  with course code and keyword search.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
                <span>Search Catalog</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* Activity Feeds: Recent Resources & Active Questions */}
        <section
          aria-labelledby="activity-feeds-heading"
          className="space-y-4"
        >
          <h2 id="activity-feeds-heading" className="sr-only">
            Platform Activity Feeds
          </h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Resources Feed */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">
                    Recent Resources
                  </h3>
                </div>
                <Link
                  href="/resources"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                >
                  <span>View all</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {overview.recentResources.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center"
                  data-testid="recent-resources-empty"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <BookOpen className="size-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {recentResourcesEmpty.title}
                  </h4>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    {recentResourcesEmpty.description}
                  </p>
                  <Link href="/resources" className="pt-1">
                    <Button variant="outline" size="sm">
                      Upload Resource
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul
                  className="divide-y divide-border rounded-xl border border-border bg-card shadow-xs"
                  data-testid="recent-resources-list"
                >
                  {overview.recentResources.map((res) => (
                    <li key={res.id}>
                      <Link
                        href={`/resources/${res.id}`}
                        className="group flex flex-col gap-2 p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                        data-testid={`recent-resource-${res.id}`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {res.courseCode}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {TYPE_PILL_LABELS[res.resourceType] ??
                                res.resourceType}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {res.title}
                          </p>
                        </div>
                        <div className="shrink-0 text-xs text-muted-foreground sm:text-right">
                          <p>{formatAcademicPeriod(res.year, res.semester)}</p>
                          <time dateTime={res.createdAt} className="text-muted-foreground/80">
                            {formatRelativeUploadDate(res.createdAt)}
                          </time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Active Questions Feed */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">
                    Active Questions
                  </h3>
                </div>
                <Link
                  href="/questions"
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                >
                  <span>View all</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {overview.recentQuestions.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center"
                  data-testid="recent-questions-empty"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <MessageSquareQuote className="size-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {recentQuestionsEmpty.title}
                  </h4>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    {recentQuestionsEmpty.description}
                  </p>
                  <Link href="/questions" className="pt-1">
                    <Button variant="outline" size="sm">
                      Ask Question
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul
                  className="divide-y divide-border rounded-xl border border-border bg-card shadow-xs"
                  data-testid="recent-questions-list"
                >
                  {overview.recentQuestions.map((q) => (
                    <li key={q.id}>
                      <Link
                        href={`/questions/${q.id}`}
                        className="group flex flex-col gap-2 p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                        data-testid={`recent-question-${q.id}`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {q.courseCode}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              {q.answerCount === 1
                                ? "1 answer"
                                : `${q.answerCount} answers`}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              {q.voteScore >= 0
                                ? `+${q.voteScore} votes`
                                : `${q.voteScore} votes`}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {q.title}
                          </p>
                        </div>
                        <div className="shrink-0 text-xs text-muted-foreground sm:text-right">
                          <p className="truncate font-medium">{q.studentName}</p>
                          <time dateTime={q.createdAt} className="text-muted-foreground/80">
                            {formatRelativeUploadDate(q.createdAt)}
                          </time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
