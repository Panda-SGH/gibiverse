export type SearchTab = "all" | "resources" | "questions"

export type SearchResultResource = {
  id: string
  title: string
  description?: string | null
  resourceType: string
  year: number
  semester: string
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
  departmentId: string
}

export type SearchResultQuestion = {
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
}

export type SearchCounts = {
  all: number
  resources: number
  questions: number
}

export type SearchResponse = {
  query: string
  type: SearchTab
  counts: SearchCounts
  resources: SearchResultResource[]
  questions: SearchResultQuestion[]
}

export function buildSearchQuery(query: string, type?: SearchTab): string {
  const trimmed = query.trim()
  if (!trimmed) {
    return "/api/search"
  }

  const params = new URLSearchParams()
  params.set("q", trimmed)
  if (type && type !== "all") {
    params.set("type", type)
  }

  return `/api/search?${params.toString()}`
}

export function getSearchEmptyState(
  query: string,
  type: SearchTab
): { title: string; description: string } {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      title: "Search Gibiverse",
      description:
        "Find resources and questions by keyword, topic, or course code.",
    }
  }

  if (type === "resources") {
    return {
      title: "No resources found",
      description: `We couldn't find any resources matching "${trimmed}". Try checking for typos or searching for a course code.`,
    }
  }

  if (type === "questions") {
    return {
      title: "No questions found",
      description: `We couldn't find any questions matching "${trimmed}". Try checking for typos or searching for a course code.`,
    }
  }

  return {
    title: "No results found",
    description: `We couldn't find any results matching "${trimmed}". Try checking for typos or searching for a course code.`,
  }
}

const API_URL = process.env.API_URL || "http://localhost:8787"

function searchBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }
  return API_URL
}

export async function searchPlatform(params: {
  query: string
  type?: SearchTab
}): Promise<SearchResponse> {
  const path = buildSearchQuery(params.query, params.type)
  if (!params.query.trim()) {
    return {
      query: "",
      type: params.type || "all",
      counts: { all: 0, resources: 0, questions: 0 },
      resources: [],
      questions: [],
    }
  }

  const res = await fetch(`${searchBaseUrl()}${path}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Failed to search platform: ${res.status}`)
  }

  return res.json() as Promise<SearchResponse>
}

export const searchCatalog = searchPlatform
