import { formatRelativeUploadDate } from "./resource-catalog"

export type QuestionSort = "newest" | "most_voted" | "unanswered"

export type QuestionCatalogFilters = {
  courseId: string | null
  departmentId: string | null
  sort: QuestionSort
}

export type CatalogQuestion = {
  id: string
  title: string
  body: string
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
  studentId: string
  studentName: string
  voteScore: number
  answerCount: number
  studentVote?: 1 | -1 | null
  userVote?: 1 | -1 | null
}

export type QuestionCatalogEmptyState = {
  title: string
  description: string
}

export { formatRelativeUploadDate }

export function hasActiveQuestionFilters(
  filters: QuestionCatalogFilters
): boolean {
  return Boolean(filters.courseId || filters.departmentId)
}

export function questionCatalogEmptyState(
  filters: QuestionCatalogFilters
): QuestionCatalogEmptyState {
  if (hasActiveQuestionFilters(filters)) {
    return {
      title: "No questions match these filters",
      description:
        "Try clearing or adjusting the department or course filters.",
    }
  }

  return {
    title: "No questions yet",
    description: "Be the first to ask an academic question for your courses.",
  }
}

export function buildQuestionsQuery(filters: QuestionCatalogFilters): string {
  const params = new URLSearchParams()
  if (filters.courseId) params.set("courseId", filters.courseId)
  if (filters.departmentId) params.set("departmentId", filters.departmentId)
  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort)
  }
  const query = params.toString()
  return query ? `/api/questions?${query}` : "/api/questions"
}

const API_URL = process.env.API_URL || "http://localhost:8787"

function questionsBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }
  return API_URL
}

export async function listQuestions(
  filters: QuestionCatalogFilters = {
    courseId: null,
    departmentId: null,
    sort: "newest",
  }
): Promise<CatalogQuestion[]> {
  const path = buildQuestionsQuery(filters)
  const res = await fetch(`${questionsBaseUrl()}${path}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`)
  }
  return res.json() as Promise<CatalogQuestion[]>
}

export async function createQuestion(input: {
  title: string
  body: string
  courseId: string
}): Promise<{ id: string }> {
  const res = await fetch("/api/questions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(payload?.error || `Failed to post question (${res.status})`)
  }
  return res.json() as Promise<{ id: string }>
}
