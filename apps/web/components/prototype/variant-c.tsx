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
  ArrowLeft,
  HelpCircle,
  X,
  Command,
  User,
} from "lucide-react"
import {
  mockResources,
  mockQuestions,
  mockAnswers,
  mockCourses,
} from "./mock-data"

type Page =
  | { name: "home" }
  | { name: "resources" }
  | { name: "resource-detail"; id: string }
  | { name: "questions" }
  | { name: "question-detail"; id: string }
  | { name: "search"; query: string; tab: "all" | "resources" | "questions" }
  | { name: "sign-in" }
  | { name: "sign-up" }

export function VariantC() {
  const [page, setPage] = React.useState<Page>({ name: "home" })
  const [cmdOpen, setCmdOpen] = React.useState(false)

  // ⌘K to open command bar
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
      if (e.key === "Escape") setCmdOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const doSearch = (q: string) => {
    if (q.trim()) {
      setPage({ name: "search", query: q.trim(), tab: "all" })
      setCmdOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ─── Minimal floating header ─── */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <button
            onClick={() => setPage({ name: "home" })}
            className="text-base font-bold tracking-tight"
          >
            G
          </button>

          {page.name !== "home" && (
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setPage({ name: "resources" })}
                className={`transition-colors ${page.name === "resources" || page.name === "resource-detail" ? "text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"}`}
              >
                Resources
              </button>
              <button
                onClick={() => setPage({ name: "questions" })}
                className={`transition-colors ${page.name === "questions" || page.name === "question-detail" ? "text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"}`}
              >
                Q&A
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-400 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
            >
              <Search className="size-3" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="ml-1 rounded border border-neutral-200 px-1 text-[10px] dark:border-neutral-700">⌘K</kbd>
            </button>
            <button
              onClick={() => setPage({ name: "sign-in" })}
              className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="pt-14">
        {page.name === "home" && <HomePage onNavigate={setPage} onSearch={doSearch} />}
        {page.name === "resources" && <ResourcesPage onNavigate={setPage} />}
        {page.name === "resource-detail" && <ResourceDetailPage id={page.id} onNavigate={setPage} />}
        {page.name === "questions" && <QuestionsPage onNavigate={setPage} />}
        {page.name === "question-detail" && <QuestionDetailPage id={page.id} onNavigate={setPage} />}
        {page.name === "search" && <SearchPage query={page.query} tab={page.tab} onNavigate={setPage} />}
        {page.name === "sign-in" && <AuthPage mode="sign-in" onNavigate={setPage} />}
        {page.name === "sign-up" && <AuthPage mode="sign-up" onNavigate={setPage} />}
      </main>

      {/* ─── Command palette ─── */}
      {cmdOpen && <CommandPalette onSearch={doSearch} onClose={() => setCmdOpen(false)} onNavigate={setPage} />}

      {/* State surface */}
      <div className="fixed bottom-20 right-4 rounded-lg border border-neutral-200 bg-white/90 p-3 text-xs font-mono shadow backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">
        <div className="font-semibold mb-1">State</div>
        <div>page: {JSON.stringify(page)}</div>
      </div>
    </div>
  )
}

// ─── Command Palette ─────────────────────────────────────────────────────────

function CommandPalette({
  onSearch,
  onClose,
  onNavigate,
}: {
  onSearch: (q: string) => void
  onClose: () => void
  onNavigate: (p: Page) => void
}) {
  const [q, setQ] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filteredResources = q
    ? mockResources.filter(
        (r) =>
          r.title.toLowerCase().includes(q.toLowerCase()) ||
          r.course.name.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 3)
    : []
  const filteredQuestions = q
    ? mockQuestions.filter(
        (qn) =>
          qn.title.toLowerCase().includes(q.toLowerCase()) ||
          qn.course.name.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 3)
    : []

  const shortcuts = [
    { label: "Resources", icon: <FileText className="size-3.5" />, action: () => { onNavigate({ name: "resources" }); onClose() } },
    { label: "Q&A", icon: <MessageCircle className="size-3.5" />, action: () => { onNavigate({ name: "questions" }); onClose() } },
    { label: "Upload Resource", icon: <Upload className="size-3.5" />, action: () => { onNavigate({ name: "resources" }); onClose() } },
    { label: "Ask a Question", icon: <HelpCircle className="size-3.5" />, action: () => { onNavigate({ name: "questions" }); onClose() } },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-neutral-800">
          <Search className="size-4 text-neutral-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
            placeholder="Search courses, resources, questions…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q === "" ? (
            <>
              <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                Quick actions
              </div>
              {shortcuts.map((s) => (
                <button
                  key={s.label}
                  onClick={s.action}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span className="text-neutral-400">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </>
          ) : (
            <>
              {filteredResources.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                    Resources
                  </div>
                  {filteredResources.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { onNavigate({ name: "resource-detail", id: r.id }); onClose() }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <FileText className="size-3.5 text-blue-400" />
                      <div className="text-left">
                        <div className="font-medium">{r.title}</div>
                        <div className="text-neutral-400">{r.course.code} · {r.type}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {filteredQuestions.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                    Questions
                  </div>
                  {filteredQuestions.map((qn) => (
                    <button
                      key={qn.id}
                      onClick={() => { onNavigate({ name: "question-detail", id: qn.id }); onClose() }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <MessageCircle className="size-3.5 text-green-400" />
                      <div className="text-left">
                        <div className="font-medium">{qn.title}</div>
                        <div className="text-neutral-400">{qn.course.code} · {qn.answerCount} answers</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {filteredResources.length === 0 && filteredQuestions.length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No results for &ldquo;{q}&rdquo;
                </div>
              )}
              <button
                onClick={() => onSearch(q)}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Search className="size-3.5" />
                Search all for &ldquo;{q}&rdquo;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
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
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-6">
      <h1 className="text-5xl font-bold tracking-tight">Gibiverse</h1>
      <p className="mt-3 text-neutral-400">
        Find academic resources. Get answers. Help each other.
      </p>
      <div className="relative mt-10 w-full max-w-xl">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-300" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
          placeholder="What are you looking for?"
          className="h-14 w-full rounded-2xl border border-neutral-200 bg-white pl-12 pr-4 text-base shadow-sm outline-none focus:border-neutral-300 focus:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        />
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => onNavigate({ name: "resources" })}
          className="flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          <FileText className="size-4" /> Resources
        </button>
        <button
          onClick={() => onNavigate({ name: "questions" })}
          className="flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          <MessageCircle className="size-4" /> Q&A
        </button>
      </div>

      <div className="mt-20 text-xs text-neutral-300 dark:text-neutral-700">
        1,247 resources · 892 questions answered · 3,500+ students
      </div>
    </div>
  )
}

// ─── Resources ───────────────────────────────────────────────────────────────

function ResourcesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showUpload, setShowUpload] = React.useState(false)
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <Upload className="size-3.5" /> Upload
        </button>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        {["All", "Past Exam", "Notes", "Slides"].map((f) => (
          <button
            key={f}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${f === "All" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {mockResources.map((r) => (
          <button
            key={r.id}
            onClick={() => onNavigate({ name: "resource-detail", id: r.id })}
            className="group flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <FileText className="size-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{r.title}</div>
              <div className="mt-0.5 text-xs text-neutral-400">
                {r.course.code} · {r.type} · {r.uploadedBy} · {r.uploadedAt}
              </div>
            </div>
            <div className="shrink-0 text-xs text-neutral-300 group-hover:text-neutral-500">
              {r.downloads} ↓
            </div>
          </button>
        ))}
      </div>

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
  if (!resource) return <div className="p-8">Not found</div>

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <button
        onClick={() => onNavigate({ name: "resources" })}
        className="mb-6 text-xs text-neutral-400 hover:text-neutral-600"
      >
        ← Resources
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{resource.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
            <span>{resource.course.code}</span>
            <span>·</span>
            <span>{resource.type}</span>
            <span>·</span>
            <span>{resource.uploadedBy}</span>
            <span>·</span>
            <span>{resource.uploadedAt}</span>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
          <Download className="size-3.5" /> Download
        </button>
      </div>

      <div className="mt-8 flex h-[550px] items-center justify-center rounded-2xl bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center text-neutral-300 dark:text-neutral-600">
          <FileText className="mx-auto size-20 stroke-[0.5]" />
          <p className="mt-3 text-sm">Preview</p>
          <p className="text-xs">{resource.fileType} · {resource.pages} pages</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-neutral-300 dark:text-neutral-600">
        {resource.downloads} downloads · {resource.pages} pages
      </div>
    </div>
  )
}

// ─── Questions ───────────────────────────────────────────────────────────────

function QuestionsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showAsk, setShowAsk] = React.useState(false)
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Q&A</h1>
        <button
          onClick={() => setShowAsk(true)}
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <HelpCircle className="size-3.5" /> Ask
        </button>
      </div>

      <div className="mt-8 space-y-0">
        {mockQuestions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => onNavigate({ name: "question-detail", id: q.id })}
            className={`flex w-full items-center gap-5 py-4 text-left ${i > 0 ? "border-t border-neutral-100 dark:border-neutral-900" : ""}`}
          >
            <div className="flex flex-col items-center text-xs text-neutral-300 min-w-[40px]">
              <span className="text-base font-bold text-neutral-600 dark:text-neutral-400">{q.voteCount}</span>
              votes
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{q.title}</div>
              <div className="mt-1 text-xs text-neutral-400">
                {q.course.code} · {q.askedBy} · {q.askedAt}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {q.hasAccepted && <CheckCircle className="size-4 text-green-400" />}
              <span className="text-xs text-neutral-300">{q.answerCount} ans</span>
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
  if (!question) return <div className="p-8">Not found</div>

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={() => onNavigate({ name: "questions" })}
        className="mb-6 text-xs text-neutral-400 hover:text-neutral-600"
      >
        ← Q&A
      </button>

      <h1 className="text-xl font-bold">{question.title}</h1>
      <div className="mt-2 text-xs text-neutral-400">
        {question.course.code} · {question.askedBy} · {question.askedAt}
      </div>

      <div className="mt-6 text-sm leading-relaxed text-neutral-500">
        I'm studying {question.course.name} and came across this concept.
        {question.title.replace("?", "")}? Any clear explanations would be appreciated.
      </div>

      <div className="mt-10">
        <div className="text-xs font-medium text-neutral-300 uppercase tracking-wider">
          {mockAnswers.length} answers
        </div>
        <div className="mt-4 space-y-6">
          {mockAnswers.map((a) => (
            <div
              key={a.id}
              className={`relative pl-8 ${a.isAccepted ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-green-400 before:rounded" : ""}`}
            >
              <div className="absolute left-0 top-0 flex flex-col items-center gap-0.5 text-neutral-300">
                <button className="hover:text-neutral-500"><ChevronUp className="size-4" /></button>
                <span className="text-xs font-bold text-neutral-500">{a.voteCount}</span>
                <button className="hover:text-neutral-500"><ChevronDown className="size-4" /></button>
              </div>
              <div className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {a.body}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-medium">{a.author}</span>
                <span>·</span>
                <span>{a.postedAt}</span>
                {a.isAccepted && (
                  <span className="ml-2 flex items-center gap-1 text-green-500">
                    <CheckCircle className="size-3" /> Accepted
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-neutral-100 pt-6 dark:border-neutral-900">
        <textarea
          placeholder="Your answer..."
          className="h-28 w-full rounded-xl border border-neutral-200 p-4 text-sm outline-none focus:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
        />
        <button className="mt-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">
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
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-xs text-neutral-400">
        Results for &ldquo;{query}&rdquo;
      </h1>

      <div className="mt-4 flex gap-4 border-b border-neutral-100 dark:border-neutral-900">
        {(["all", "resources", "questions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onNavigate({ name: "search", query, tab: t })}
            className={`border-b-2 pb-2 text-xs font-medium capitalize ${
              tab === t
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {(tab === "all" || tab === "resources") &&
          filteredResources.map((r) => (
            <button
              key={`r-${r.id}`}
              onClick={() => onNavigate({ name: "resource-detail", id: r.id })}
              className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <FileText className="size-4 text-blue-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-neutral-400">{r.course.code} · {r.type}</div>
              </div>
            </button>
          ))}
        {(tab === "all" || tab === "questions") &&
          filteredQuestions.map((q) => (
            <button
              key={`q-${q.id}`}
              onClick={() => onNavigate({ name: "question-detail", id: q.id })}
              className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <MessageCircle className="size-4 text-green-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{q.title}</div>
                <div className="text-xs text-neutral-400">{q.course.code} · {q.answerCount} answers</div>
              </div>
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
    <div className="flex min-h-[85vh] items-center justify-center px-6">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-xl font-bold tracking-tight">
          {mode === "sign-in" ? "Welcome back" : "Join Gibiverse"}
        </h1>
        <div className="mt-8 space-y-3 text-left">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
            Continue with Google
          </button>
          <div className="relative text-center text-xs text-neutral-300">
            <span className="bg-white px-3 dark:bg-neutral-950">or</span>
            <div className="absolute left-0 right-0 top-1/2 -z-10 border-t border-neutral-100 dark:border-neutral-900" />
          </div>
          <input placeholder="Email" className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-900" />
          <input type="password" placeholder="Password" className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-900" />
          {mode === "sign-up" && <input placeholder="Full name" className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none dark:border-neutral-800 dark:bg-neutral-900" />}
          <button className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
            {mode === "sign-in" ? "Sign In" : "Create Account"}
          </button>
        </div>
        <p className="mt-6 text-xs text-neutral-400">
          {mode === "sign-in" ? (
            <>New here? <button onClick={() => onNavigate({ name: "sign-up" })} className="text-neutral-900 dark:text-white">Create an account</button></>
          ) : (
            <>Have an account? <button onClick={() => onNavigate({ name: "sign-in" })} className="text-neutral-900 dark:text-white">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function UploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
        <h2 className="text-lg font-bold">Upload Resource</h2>
        <div className="mt-4 space-y-3">
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 text-sm text-neutral-300 dark:border-neutral-800">
            Drop files here
          </div>
          <input placeholder="Title" className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm dark:border-neutral-800 dark:bg-neutral-800" />
          <select className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm dark:border-neutral-800 dark:bg-neutral-800">
            <option>Select Course</option>
            {mockCourses.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <select className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm dark:border-neutral-800 dark:bg-neutral-800">
            <option>Type</option><option>Past Exam</option><option>Notes</option><option>Slides</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-xs text-neutral-400 hover:text-neutral-600">Cancel</button>
          <button className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">Upload</button>
        </div>
      </div>
    </div>
  )
}

function AskModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
        <h2 className="text-lg font-bold">Ask a Question</h2>
        <div className="mt-4 space-y-3">
          <input placeholder="Question title" className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm dark:border-neutral-800 dark:bg-neutral-800" />
          <select className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm dark:border-neutral-800 dark:bg-neutral-800">
            <option>Select Course</option>
            {mockCourses.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <textarea placeholder="Describe your question…" className="h-28 w-full rounded-xl border border-neutral-200 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-800" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-xs text-neutral-400 hover:text-neutral-600">Cancel</button>
          <button className="rounded-full bg-neutral-900 px-5 py-2 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">Post</button>
        </div>
      </div>
    </div>
  )
}
