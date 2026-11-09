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
  User,
  HelpCircle,
  Home,
  PanelLeftClose,
  PanelLeft,
  Filter,
  SortAsc,
  Clock,
  TrendingUp,
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

export function VariantB() {
  const [page, setPage] = React.useState<Page>({ name: "home" })
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [searchValue, setSearchValue] = React.useState("")

  const doSearch = (q: string) => {
    if (q.trim()) setPage({ name: "search", query: q.trim(), tab: "all" })
  }

  // Auth pages render without sidebar
  if (page.name === "sign-in" || page.name === "sign-up") {
    return <AuthPage mode={page.name} onNavigate={setPage} />
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ─── Sidebar ─── */}
      {sidebarOpen && (
        <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex h-12 items-center justify-between px-3">
            <span className="text-sm font-bold tracking-tight">Gibiverse</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 px-2 py-2">
            <SidebarItem
              icon={<Home className="size-4" />}
              label="Home"
              active={page.name === "home"}
              onClick={() => setPage({ name: "home" })}
            />
            <SidebarItem
              icon={<FileText className="size-4" />}
              label="Resources"
              active={page.name === "resources" || page.name === "resource-detail"}
              onClick={() => setPage({ name: "resources" })}
            />
            <SidebarItem
              icon={<MessageCircle className="size-4" />}
              label="Q&A"
              active={page.name === "questions" || page.name === "question-detail"}
              onClick={() => setPage({ name: "questions" })}
            />
          </nav>

          <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
            <SidebarItem
              icon={<User className="size-4" />}
              label="Sign In"
              active={false}
              onClick={() => setPage({ name: "sign-in" })}
            />
          </div>
        </aside>
      )}

      {/* ─── Main area ─── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-neutral-200 px-4 dark:border-neutral-800">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <PanelLeft className="size-4" />
            </button>
          )}
          <Breadcrumb page={page} onNavigate={setPage} />
          <div className="relative ml-auto w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(searchValue)}
              placeholder="Search..."
              className="h-8 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-8 pr-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-600"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {page.name === "home" && <HomePage onNavigate={setPage} onSearch={doSearch} />}
          {page.name === "resources" && <ResourcesPage onNavigate={setPage} />}
          {page.name === "resource-detail" && <ResourceDetailPage id={page.id} onNavigate={setPage} />}
          {page.name === "questions" && <QuestionsPage onNavigate={setPage} />}
          {page.name === "question-detail" && <QuestionDetailPage id={page.id} onNavigate={setPage} />}
          {page.name === "search" && <SearchPage query={page.query} tab={page.tab} onNavigate={setPage} />}
        </main>
      </div>

      {/* State surface */}
      <div className="fixed bottom-20 right-4 rounded-lg border border-neutral-200 bg-white/90 p-3 text-xs font-mono shadow backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">
        <div className="font-semibold mb-1">State</div>
        <div>page: {JSON.stringify(page)}</div>
        <div>sidebar: {sidebarOpen ? "open" : "closed"}</div>
      </div>
    </div>
  )
}

// ─── Sidebar Components ──────────────────────────────────────────────────────

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function Breadcrumb({
  page,
  onNavigate,
}: {
  page: Page
  onNavigate: (p: Page) => void
}) {
  const crumbs: { label: string; onClick?: () => void }[] = []

  if (page.name === "home") crumbs.push({ label: "Home" })
  if (page.name === "resources") crumbs.push({ label: "Resources" })
  if (page.name === "resource-detail") {
    crumbs.push({ label: "Resources", onClick: () => onNavigate({ name: "resources" }) })
    const r = mockResources.find((r) => r.id === page.id)
    crumbs.push({ label: r?.title ?? "Detail" })
  }
  if (page.name === "questions") crumbs.push({ label: "Q&A" })
  if (page.name === "question-detail") {
    crumbs.push({ label: "Q&A", onClick: () => onNavigate({ name: "questions" }) })
    const q = mockQuestions.find((q) => q.id === page.id)
    crumbs.push({ label: q?.title ?? "Detail" })
  }
  if (page.name === "search") crumbs.push({ label: `Search: "${page.query}"` })

  return (
    <div className="flex items-center gap-1 text-xs text-neutral-400">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="mx-1">/</span>}
          {c.onClick ? (
            <button onClick={c.onClick} className="hover:text-neutral-600 dark:hover:text-neutral-200">
              {c.label}
            </button>
          ) : (
            <span className="text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">{c.label}</span>
          )}
        </React.Fragment>
      ))}
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-lg font-semibold">Welcome to Gibiverse</h1>
        <p className="mt-1 text-sm text-neutral-500">Find resources and get answers for your courses.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-lg">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
          placeholder="Search courses, resources, questions..."
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent resources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="size-3.5" /> Recent Resources
            </h2>
            <button
              onClick={() => onNavigate({ name: "resources" })}
              className="text-xs text-blue-500 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-1">
            {mockResources.slice(0, 4).map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate({ name: "resource-detail", id: r.id })}
                className="flex w-full items-center gap-3 rounded-md bg-white p-2.5 text-left text-xs hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <FileText className="size-4 shrink-0 text-blue-400" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-neutral-400 mt-0.5">{r.course.code} · {r.uploadedAt}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="size-3.5" /> Active Questions
            </h2>
            <button
              onClick={() => onNavigate({ name: "questions" })}
              className="text-xs text-green-500 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-1">
            {mockQuestions.slice(0, 4).map((q) => (
              <button
                key={q.id}
                onClick={() => onNavigate({ name: "question-detail", id: q.id })}
                className="flex w-full items-center gap-3 rounded-md bg-white p-2.5 text-left text-xs hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <MessageCircle className="size-4 shrink-0 text-green-400" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{q.title}</div>
                  <div className="text-neutral-400 mt-0.5">
                    {q.course.code} · {q.answerCount} answers · {q.askedAt}
                  </div>
                </div>
                {q.hasAccepted && <CheckCircle className="size-3.5 shrink-0 text-green-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { label: "Resources", value: "1,247", color: "text-blue-500" },
          { label: "Questions Answered", value: "892", color: "text-green-500" },
          { label: "Active Students", value: "3,500+", color: "text-purple-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg bg-white p-4 dark:bg-neutral-900"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-neutral-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Resources (table layout) ────────────────────────────────────────────────

function ResourcesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showUpload, setShowUpload] = React.useState(false)
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-semibold">Resources</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
        >
          <Upload className="size-3.5" /> Upload
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <button className="flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1 text-xs dark:border-neutral-700">
          <Filter className="size-3" /> Filter
        </button>
        <button className="flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1 text-xs dark:border-neutral-700">
          <SortAsc className="size-3" /> Sort
        </button>
        <div className="ml-auto flex gap-1">
          {["All", "Past Exam", "Notes", "Slides"].map((f) => (
            <button
              key={f}
              className={`rounded-md px-2 py-1 text-xs ${f === "All" ? "bg-neutral-200 dark:bg-neutral-700" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-400 dark:border-neutral-800">
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Course</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Uploaded</th>
              <th className="px-3 py-2 font-medium text-right">Downloads</th>
            </tr>
          </thead>
          <tbody>
            {mockResources.map((r) => (
              <tr
                key={r.id}
                onClick={() => onNavigate({ name: "resource-detail", id: r.id })}
                className="border-b border-neutral-100 cursor-pointer hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
              >
                <td className="px-3 py-2.5 font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 text-blue-400 shrink-0" />
                    <span className="truncate max-w-[250px]">{r.title}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-neutral-500">
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">{r.course.code}</span>
                </td>
                <td className="px-3 py-2.5 text-neutral-500">{r.type}</td>
                <td className="px-3 py-2.5 text-neutral-400">{r.uploadedAt}</td>
                <td className="px-3 py-2.5 text-right text-neutral-400">{r.downloads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}

// ─── Resource Detail (split pane) ────────────────────────────────────────────

function ResourceDetailPage({
  id,
  onNavigate,
}: {
  id: string
  onNavigate: (p: Page) => void
}) {
  const resource = mockResources.find((r) => r.id === id)
  if (!resource) return <div className="p-6 text-sm">Resource not found</div>

  return (
    <div className="flex h-full">
      {/* Preview */}
      <div className="flex flex-1 items-center justify-center border-r border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-center text-neutral-400">
          <FileText className="mx-auto size-16 stroke-1" />
          <p className="mt-2 text-sm">Document preview</p>
          <p className="text-xs">{resource.fileType} · {resource.pages} pages</p>
        </div>
      </div>

      {/* Sidebar detail */}
      <div className="w-72 shrink-0 overflow-y-auto p-4">
        <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {resource.type}
        </span>
        <h1 className="mt-2 text-sm font-bold leading-tight">{resource.title}</h1>

        <div className="mt-4 space-y-3 text-xs">
          <div>
            <div className="text-neutral-400">Course</div>
            <div className="font-medium">{resource.course.name}</div>
            <div className="text-neutral-500">{resource.course.code}</div>
          </div>
          <div>
            <div className="text-neutral-400">Uploaded by</div>
            <div className="font-medium">{resource.uploadedBy}</div>
          </div>
          <div>
            <div className="text-neutral-400">Date</div>
            <div>{resource.uploadedAt}</div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-neutral-400">Downloads</div>
              <div className="font-medium">{resource.downloads}</div>
            </div>
            <div>
              <div className="text-neutral-400">Pages</div>
              <div className="font-medium">{resource.pages}</div>
            </div>
          </div>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-xs font-medium text-white hover:bg-blue-600">
          <Download className="size-3.5" /> Download
        </button>
      </div>
    </div>
  )
}

// ─── Questions (list) ────────────────────────────────────────────────────────

function QuestionsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showAsk, setShowAsk] = React.useState(false)
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-semibold">Q&A</h1>
        <button
          onClick={() => setShowAsk(true)}
          className="flex items-center gap-1.5 rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
        >
          <HelpCircle className="size-3.5" /> Ask Question
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <select className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800">
          <option>All Courses</option>
          {mockCourses.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800">
          <option>Newest</option>
          <option>Most Voted</option>
          <option>Unanswered</option>
        </select>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {mockQuestions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => onNavigate({ name: "question-detail", id: q.id })}
            className={`flex w-full items-center gap-4 p-3 text-left text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""}`}
          >
            <div className="flex flex-col items-center min-w-[40px] text-neutral-400">
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{q.voteCount}</span>
              <span>votes</span>
            </div>
            <div className={`flex flex-col items-center min-w-[40px] ${q.hasAccepted ? "text-green-500" : "text-neutral-400"}`}>
              <span className="text-sm font-semibold">{q.answerCount}</span>
              <span>ans</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{q.title}</div>
              <div className="text-neutral-400 mt-0.5">
                <span className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">{q.course.code}</span>
                {" · "}{q.askedBy} · {q.askedAt}
              </div>
            </div>
            {q.hasAccepted && <CheckCircle className="size-4 shrink-0 text-green-500" />}
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
  if (!question) return <div className="p-6 text-sm">Question not found</div>

  return (
    <div className="max-w-3xl p-6">
      <h1 className="text-sm font-bold">{question.title}</h1>
      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">{question.course.code}</span>
        <span>Asked by {question.askedBy}</span>
        <span>·</span>
        <span>{question.askedAt}</span>
      </div>

      <div className="mt-4 rounded-lg bg-white p-4 text-xs leading-relaxed text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
        I'm studying {question.course.name} and came across this concept.
        {question.title.replace("?", "")}? Any clear explanations would be appreciated.
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          {mockAnswers.length} Answers
        </h2>
        <div className="space-y-3">
          {mockAnswers.map((a) => (
            <div
              key={a.id}
              className={`flex gap-3 rounded-lg bg-white p-3 text-xs dark:bg-neutral-900 ${a.isAccepted ? "ring-1 ring-green-300 dark:ring-green-800" : ""}`}
            >
              <div className="flex flex-col items-center gap-0.5 text-neutral-400 min-w-[28px]">
                <button className="hover:text-neutral-600"><ChevronUp className="size-4" /></button>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{a.voteCount}</span>
                <button className="hover:text-neutral-600"><ChevronDown className="size-4" /></button>
                {a.isAccepted && <CheckCircle className="mt-0.5 size-4 text-green-500" />}
              </div>
              <div className="flex-1">
                <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">{a.body}</p>
                <div className="mt-2 text-neutral-400">
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">{a.author}</span> · {a.postedAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <textarea
          placeholder="Write your answer..."
          className="h-24 w-full rounded-lg border border-neutral-200 bg-white p-3 text-xs outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <button className="mt-2 rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600">
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
    <div className="p-6">
      <h1 className="text-sm font-semibold mb-4">
        Results for &ldquo;{query}&rdquo;
      </h1>
      <div className="flex gap-1 mb-4">
        {(["all", "resources", "questions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onNavigate({ name: "search", query, tab: t })}
            className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
              tab === t
                ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white"
                : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {(tab === "all" || tab === "resources") &&
          filteredResources.map((r) => (
            <button
              key={`r-${r.id}`}
              onClick={() => onNavigate({ name: "resource-detail", id: r.id })}
              className="flex w-full items-center gap-3 rounded-md bg-white p-2.5 text-left text-xs hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <FileText className="size-3.5 text-blue-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{r.title}</div>
                <div className="text-neutral-400">{r.course.code} · {r.type}</div>
              </div>
              <span className="text-blue-500 text-[10px] font-medium">RESOURCE</span>
            </button>
          ))}
        {(tab === "all" || tab === "questions") &&
          filteredQuestions.map((q) => (
            <button
              key={`q-${q.id}`}
              onClick={() => onNavigate({ name: "question-detail", id: q.id })}
              className="flex w-full items-center gap-3 rounded-md bg-white p-2.5 text-left text-xs hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <MessageCircle className="size-3.5 text-green-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{q.title}</div>
                <div className="text-neutral-400">{q.course.code} · {q.answerCount} answers</div>
              </div>
              <span className="text-green-500 text-[10px] font-medium">Q&A</span>
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
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 bg-neutral-900 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-sm text-white">
          <h2 className="text-2xl font-bold">Gibiverse</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Share knowledge, help each other succeed. Join your campus community.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-bold">
            {mode === "sign-in" ? "Sign In" : "Create Account"}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            {mode === "sign-in" ? "Welcome back" : "Join your campus community"}
          </p>
          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-200 py-2 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-700">
              Continue with Google
            </button>
            <div className="relative text-center text-xs text-neutral-400">
              <span className="bg-white px-2 dark:bg-neutral-950">or</span>
              <div className="absolute left-0 right-0 top-1/2 -z-10 border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <input placeholder="Email" className="h-9 w-full rounded-md border border-neutral-200 px-3 text-xs dark:border-neutral-700 dark:bg-neutral-900" />
            <input type="password" placeholder="Password" className="h-9 w-full rounded-md border border-neutral-200 px-3 text-xs dark:border-neutral-700 dark:bg-neutral-900" />
            {mode === "sign-up" && <input placeholder="Full name" className="h-9 w-full rounded-md border border-neutral-200 px-3 text-xs dark:border-neutral-700 dark:bg-neutral-900" />}
            <button className="w-full rounded-md bg-neutral-900 py-2 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">
              {mode === "sign-in" ? "Sign In" : "Create Account"}
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-neutral-500">
            {mode === "sign-in" ? (
              <>Don&apos;t have an account? <button onClick={() => onNavigate({ name: "sign-up" })} className="font-medium text-neutral-900 dark:text-white">Sign Up</button></>
            ) : (
              <>Already have an account? <button onClick={() => onNavigate({ name: "sign-in" })} className="font-medium text-neutral-900 dark:text-white">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function UploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-neutral-900">
        <h2 className="text-sm font-semibold">Upload Resource</h2>
        <div className="mt-3 space-y-2">
          <div className="flex h-20 items-center justify-center rounded-md border-2 border-dashed border-neutral-300 text-xs text-neutral-400 dark:border-neutral-700">
            Drop files or click to browse
          </div>
          <input placeholder="Title" className="h-8 w-full rounded-md border border-neutral-200 px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800" />
          <select className="h-8 w-full rounded-md border border-neutral-200 px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
            <option>Select Course</option>
            {mockCourses.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <select className="h-8 w-full rounded-md border border-neutral-200 px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
            <option>Type</option><option>Past Exam</option><option>Notes</option><option>Slides</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-700">Cancel</button>
          <button className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white">Upload</button>
        </div>
      </div>
    </div>
  )
}

function AskModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:bg-neutral-900">
        <h2 className="text-sm font-semibold">Ask a Question</h2>
        <div className="mt-3 space-y-2">
          <input placeholder="Question title" className="h-8 w-full rounded-md border border-neutral-200 px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800" />
          <select className="h-8 w-full rounded-md border border-neutral-200 px-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
            <option>Select Course</option>
            {mockCourses.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <textarea placeholder="Describe your question..." className="h-24 w-full rounded-md border border-neutral-200 p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-700">Cancel</button>
          <button className="rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white">Post</button>
        </div>
      </div>
    </div>
  )
}
