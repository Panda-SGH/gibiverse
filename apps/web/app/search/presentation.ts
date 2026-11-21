import type { SearchType } from "@gibiverse/shared/types"

export type { SearchType }
export type SearchTab = SearchType

export type SearchResultResource = {
  id: string
  title: string
  resourceType: string
  academicPeriod: string
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
  type: SearchType
  counts: SearchCounts
  resources: SearchResultResource[]
  questions: SearchResultQuestion[]
}

export function emptySearchResponse(type: SearchType = "all"): SearchResponse {
  return {
    query: "",
    type,
    counts: { all: 0, resources: 0, questions: 0 },
    resources: [],
    questions: [],
  }
}

export function buildSearchQuery(query: string, type?: SearchType): string {
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

export function buildSearchPageUrl(query: string, type?: SearchType): string {
  const trimmed = query.trim()
  if (!trimmed) {
    return type && type !== "all" ? `/search?type=${type}` : "/search"
  }

  const params = new URLSearchParams()
  params.set("q", trimmed)
  if (type && type !== "all") {
    params.set("type", type)
  }

  return `/search?${params.toString()}`
}

export function getSearchEmptyState(
  query: string,
  type: SearchType
): { title: string; description: string } {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      title: "Search Gibiverse",
      description:
        "Find course materials and questions by keyword, topic, or course code.",
    }
  }

  if (type === "resources") {
    return {
      title: "No course materials found",
      description: `We couldn't find any course materials matching "${trimmed}". Try checking for typos or searching for a course code.`,
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
