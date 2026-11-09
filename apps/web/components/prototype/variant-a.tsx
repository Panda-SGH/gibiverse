"use client"

import * as React from "react"
import {
  Search,
  Upload,
  FileText,
  MessageCircle,
  Download,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  User,
  HelpCircle,
} from "lucide-react"
import {
  mockResources,
  mockQuestions,
  mockAnswers,
  mockCourses,
  type Resource,
  type Question,
} from "./mock-data"

// ─── Pages ───────────────────────────────────────────────────────────────────
type Page =
  | { name: "home" }
  | { name: "resources" }
  | { name: "resource-detail"; id: string }
  | { name: "questions" }
  | { name: "question-detail"; id: string }
  | { name: "search"; query: string; tab: "all" | "resources" | "questions" }
  | { name: "sign-in" }
  | { name: "sign-up" }

export function VariantA() {
  const [page, setPage] = React.useState<Page>({ name: "home" })
  const [searchValue, setSearchValue] = React.useState("")

  const doSearch = (q: string) => {
    if (q.trim()) setPage({ name: "search", query: q.trim(), tab: "all" })
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      {/* ─── Top Nav ─── */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <button
            onClick={() => setPage({ name: "home" })}
            className="text-lg font-bold tracking-tight"
          >
            Gibiverse
          </button>
          <nav className="flex gap-1">
            <NavLink
              active={page.name === "resources" || page.name === "resource-detail"}
              onClick={() => setPage({ name: "resources" })}
            >
              <FileText className="size-4" /> Resources
            </NavLink>
            <NavLink
              active={page.name === "questions" || page.name === "question-detail"}
              onClick={() => setPage({ name: "questions" })}
            >
              <MessageCircle className="size-4" /> Q&A
            </NavLink>
          </nav>
          <div className="relative ml-auto flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(searchValue)}
              placeholder="Search resources, questions..."
              className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500"
            />
          </div>
          <button
            onClick={() => setPage({ name: "sign-in" })}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <User className="size-4" /> Sign In
          </button>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="flex-1">
        {page.name === "home" && <HomePage onNavigate={setPage} onSearch={doSearch} />}
        {page.name === "resources" && <ResourcesPage onNavigate={setPage} />}
        {page.name === "resource-detail" && (
          <ResourceDetailPage id={page.id} onNavigate={setPage} />
        )}
        {page.name === "questions" && <QuestionsPage onNavigate={setPage} />}
        {page.name === "question-detail" && (
          <QuestionDetailPage id={page.id} onNavigate={setPage} />
        )}
        {page.name === "search" && (
          <SearchPage query={page.query} tab={page.tab} onNavigate={setPage} />
        )}
        {page.name === "sign-in" && <AuthPage mode="sign-in" onNavigate={setPage} />}
        {page.name === "sign-up" && <AuthPage mode="sign-up" onNavigate={setPage} />}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
        Gibiverse — Share knowledge, help each other.
      </footer>

      {/* ─── State surface ─── */}
      <div className="fixed bottom-20 right-4 rounded-lg border border-neutral-200 bg-white/90 p-3 text-xs font-mono shadow backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">
        <div className="font-semibold mb-1">State</div>
        <div>page: {JSON.stringify(page)}</div>
      </div>
    </div>
  )
}

// ─── Components ──────────────────────────────────────────────────────────────

function NavLink({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
          : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
}

// ─── Home ────────────────────────────────────────────────────────────────────

function HomePage({
  onNavigate,
  onSearch,
}: {
  onNavigate: (p: Page) => void
  onSearch: (q: string) => void
}) {
  const [q, setQ] = React.useState("")
  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Find what you need. Share what you know.
        </h1>
        <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400">
          Academic resources and Q&A for your courses — all in one place.
        </p>
        <div className="relative mx-auto mt-8 max-w-lg">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
            placeholder="Search courses, resources, questions..."
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-12 pr-4 text-base shadow-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-neutral-800"
          />
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate({ name: "resources" })}
          className="group rounded-xl border border-neutral-200 p-6 text-left transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-700"
        >
          <FileText className="size-8 text-blue-500" />
          <h3 className="mt-3 text-lg font-semibold">Resources</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Past exams, notes, slides, and study materials shared by students.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-500">
            Browse resources <ArrowRight className="size-4" />
          </span>
        </button>
        <button
          onClick={() => onNavigate({ name: "questions" })}
          className="group rounded-xl border border-neutral-200 p-6 text-left transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-700"
        >
          <HelpCircle className="size-8 text-green-500" />
          <h3 className="mt-3 text-lg font-semibold">Q&A</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Ask questions, get answers, and help your classmates.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-500">
            Browse questions <ArrowRight className="size-4" />
          </span>
        </button>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold">1,247</div>
          <div className="text-sm text-neutral-500">Resources shared</div>
        </div>
        <div>
          <div className="text-3xl font-bold">892</div>
          <div className="text-sm text-neutral-500">Questions answered</div>
        </div>
        <div>
          <div className="text-3xl font-bold">3,500+</div>
          <div className="text-sm text-neutral-500">Active students</div>
        </div>
      </div>
    </div>
  )
}

// ─── Resources Listing ───────────────────────────────────────────────────────

function ResourcesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showUpload, setShowUpload] = React.useState(false)
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <SectionTitle>Resources</SectionTitle>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Upload className="size-4" /> Upload Resource
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-2">
        {["All", "Past Exam", "Notes", "Slides"].map((f) => (
          <button
            key={f}
            className={`rounded-full px-3 py-1 text-sm ${f === "All" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"}`}
          >
            {f}
          </button>
        ))}
        <select className="ml-auto rounded-lg border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900">
          <option>All Courses</option>
          {mockCourses.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {mockResources.map((r) => (
          <button
            key={r.id}
            onClick={() => onNavigate({ name: "resource-detail", id: r.id })}
            className="rounded-xl border border-neutral-200 p-4 text-left transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:hover:border-neutral-700"
          >
            <div className="flex items-start justify-between">
              <FileText className="size-8 text-blue-400" />
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {r.type}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold leading-tight">{r.title}</h3>
            <p className="mt-1 text-xs text-neutral-500">
              {r.course.code} · {r.course.name}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
              <span>{r.uploadedBy}</span>
              <span>·</span>
              <span>{r.uploadedAt}</span>
              <span className="ml-auto flex items-center gap-1">
                <Download className="size-3" /> {r.downloads}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Upload modal */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}

// ─── Resource Detail ─────────────────────────────────────────────────────────

function ResourceDetailPage({
  id,
  onNavigate,
}: {
  id: string
  onNavigate: (p: Page) => void
}) {
  const resource = mockResources.find((r) => r.id === id)
  if (!resource) return <div className="p-8">Resource not found</div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => onNavigate({ name: "resources" })}
        className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="size-4" /> Back to Resources
      </button>

      <div className="flex items-start justify-between">
        <div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {resource.type}
          </span>
          <h1 className="mt-2 text-2xl font-bold">{resource.title}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {resource.course.code} · {resource.course.name}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600">
          <Download className="size-4" /> Download
        </button>
      </div>

      <div className="mt-4 flex gap-6 text-sm text-neutral-500">
        <span>Uploaded by {resource.uploadedBy}</span>
        <span>{resource.uploadedAt}</span>
        <span>{resource.downloads} downloads</span>
        <span>{resource.pages} pages</span>
      </div>

      {/* Preview placeholder */}
      <div className="mt-8 flex h-[500px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-center text-neutral-400">
          <FileText className="mx-auto size-16 stroke-1" />
          <p className="mt-2 text-sm">Document preview</p>
          <p className="text-xs">{resource.fileType} · {resource.pages} pages</p>
        </div>
      </div>
    </div>
  )
}

// ─── Questions Listing ───────────────────────────────────────────────────────

function QuestionsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showAsk, setShowAsk] = React.useState(false)
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <SectionTitle>Q&A</SectionTitle>
        <button
          onClick={() => setShowAsk(true)}
          className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          <HelpCircle className="size-4" /> Ask a Question
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <select className="rounded-lg border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900">
          <option>All Courses</option>
          {mockCourses.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="rounded-lg border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900">
          <option>Newest</option>
          <option>Most Voted</option>
          <option>Unanswered</option>
        </select>
      </div>

      <div className="mt-6 divide-y divide-neutral-100 dark:divide-neutral-800">
        {mockQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => onNavigate({ name: "question-detail", id: q.id })}
            className="flex w-full gap-4 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/50 -mx-2 px-2 rounded-lg"
          >
            <div className="flex flex-col items-center gap-1 text-xs text-neutral-400 min-w-[60px]">
              <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                {q.voteCount}
              </span>
              votes
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-neutral-400 min-w-[60px]">
              <span
                className={`text-lg font-semibold ${q.hasAccepted ? "text-green-500" : "text-neutral-700 dark:text-neutral-300"}`}
              >
                {q.answerCount}
              </span>
              answers
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium leading-tight">{q.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                  {q.course.code}
                </span>
                <span>{q.askedBy}</span>
                <span>·</span>
                <span>{q.askedAt}</span>
                {q.hasAccepted && (
                  <CheckCircle className="size-3.5 text-green-500" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {showAsk && <AskModal onClose={() => setShowAsk(false)} />}
    </div>
  )
}

// ─── Question Detail ─────────────────────────────────────────────────────────

function QuestionDetailPage({
  id,
  onNavigate,
}: {
  id: string
  onNavigate: (p: Page) => void
}) {
  const question = mockQuestions.find((q) => q.id === id)
  if (!question) return <div className="p-8">Question not found</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => onNavigate({ name: "questions" })}
        className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <ArrowLeft className="size-4" /> Back to Q&A
      </button>

      <h1 className="text-xl font-bold">{question.title}</h1>
      <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
          {question.course.code}
        </span>
        <span>Asked by {question.askedBy}</span>
        <span>{question.askedAt}</span>
      </div>

      <div className="mt-6 border-b border-neutral-200 pb-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
        <p>
          I'm studying {question.course.name} and came across this concept.
          {question.title.replace("?", "")}? Any clear explanations would be appreciated.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">
          {mockAnswers.length} Answers
        </h2>
        <div className="mt-4 space-y-6">
          {mockAnswers.map((a) => (
            <div
              key={a.id}
              className={`flex gap-4 rounded-lg p-4 ${a.isAccepted ? "border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10" : ""}`}
            >
              <div className="flex flex-col items-center gap-1 text-neutral-400">
                <button className="hover:text-neutral-600">
                  <ChevronUp className="size-5" />
                </button>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {a.voteCount}
                </span>
                <button className="hover:text-neutral-600">
                  <ChevronDown className="size-5" />
                </button>
                {a.isAccepted && (
                  <CheckCircle className="mt-1 size-5 text-green-500" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="text-neutral-600 dark:text-neutral-300">{a.body}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    {a.author}
                  </span>
                  <span>·</span>
                  <span>{a.postedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer box */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold">Your Answer</h3>
        <textarea
          placeholder="Write your answer..."
          className="mt-2 h-32 w-full rounded-lg border border-neutral-200 p-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button className="mt-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
          Post Answer
        </button>
      </div>
    </div>
  )
}

// ─── Search ──────────────────────────────────────────────────────────────────

function SearchPage({
  query,
  tab,
  onNavigate,
}: {
  query: string
  tab: "all" | "resources" | "questions"
  onNavigate: (p: Page) => void
}) {
  const filteredResources = mockResources.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.course.name.toLowerCase().includes(query.toLowerCase())
  )
  const filteredQuestions = mockQuestions.filter(
    (q) =>
      q.title.toLowerCase().includes(query.toLowerCase()) ||
      q.course.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-lg font-semibold">
        Results for &ldquo;{query}&rdquo;
      </h1>
      <div className="mt-4 flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {(["all", "resources", "questions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onNavigate({ name: "search", query, tab: t })}
            className={`border-b-2 px-3 py-2 text-sm font-medium capitalize ${
              tab === t
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t}
            <span className="ml-1 text-xs text-neutral-400">
              {t === "all"
                ? filteredResources.length + filteredQuestions.length
                : t === "resources"
                  ? filteredResources.length
                  : filteredQuestions.length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {(tab === "all" || tab === "resources") &&
          filteredResources.map((r) => (
            <button
              key={`r-${r.id}`}
              onClick={() => onNavigate({ name: "resource-detail", id: r.id })}
              className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 p-3 text-left hover:border-neutral-300 dark:border-neutral-800"
            >
              <FileText className="size-5 shrink-0 text-blue-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-neutral-400">
                  {r.course.code} · {r.type} · {r.downloads} downloads
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                Resource
              </span>
            </button>
          ))}
        {(tab === "all" || tab === "questions") &&
          filteredQuestions.map((q) => (
            <button
              key={`q-${q.id}`}
              onClick={() => onNavigate({ name: "question-detail", id: q.id })}
              className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 p-3 text-left hover:border-neutral-300 dark:border-neutral-800"
            >
              <MessageCircle className="size-5 shrink-0 text-green-400" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{q.title}</div>
                <div className="text-xs text-neutral-400">
                  {q.course.code} · {q.answerCount} answers · {q.voteCount} votes
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600 dark:bg-green-900/30 dark:text-green-400">
                Question
              </span>
            </button>
          ))}
      </div>
    </div>
  )
}

// ─── Auth ────────────────────────────────────────────────────────────────────

function AuthPage({
  mode,
  onNavigate,
}: {
  mode: "sign-in" | "sign-up"
  onNavigate: (p: Page) => void
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4">
      <div className="w-full">
        <h1 className="text-2xl font-bold">
          {mode === "sign-in" ? "Sign In" : "Sign Up"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {mode === "sign-in"
            ? "Welcome back to Gibiverse"
            : "Join your campus community"}
        </p>
        <div className="mt-6 space-y-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
            Continue with Google
          </button>
          <div className="relative text-center text-xs text-neutral-400">
            <span className="bg-white px-2 dark:bg-neutral-950">or</span>
            <div className="absolute left-0 right-0 top-1/2 -z-10 border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <input
            placeholder="Email"
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <input
            type="password"
            placeholder="Password"
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
          />
          {mode === "sign-up" && (
            <input
              placeholder="Full name"
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
            />
          )}
          <button className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
            {mode === "sign-in" ? "Sign In" : "Create Account"}
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-neutral-500">
          {mode === "sign-in" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => onNavigate({ name: "sign-up" })}
                className="font-medium text-neutral-900 dark:text-white"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => onNavigate({ name: "sign-in" })}
                className="font-medium text-neutral-900 dark:text-white"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function UploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Upload Resource</h2>
        <div className="mt-4 space-y-3">
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-sm text-neutral-400 dark:border-neutral-700">
            Drop files here or click to browse
          </div>
          <input
            placeholder="Title"
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <select className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option>Select Course</option>
            {mockCourses.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option>Resource Type</option>
            <option>Past Exam</option>
            <option>Notes</option>
            <option>Slides</option>
            <option>Other</option>
          </select>
          <textarea
            placeholder="Description (optional)"
            className="h-20 w-full rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}

function AskModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Ask a Question</h2>
        <div className="mt-4 space-y-3">
          <input
            placeholder="Question title"
            className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
          <select className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800">
            <option>Select Course</option>
            {mockCourses.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
          <textarea
            placeholder="Describe your question in detail..."
            className="h-32 w-full rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
            Post Question
          </button>
        </div>
      </div>
    </div>
  )
}
