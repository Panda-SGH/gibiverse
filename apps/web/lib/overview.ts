import type { ResourceType, Semester } from "./resource-validation.js"

export type PlatformStats = {
  totalResources: number
  totalQuestions: number
  activeCourses: number
}

export type OverviewRecentResource = {
  id: string
  title: string
  resourceType: ResourceType
  year: number
  semester: Semester
  createdAt: string
  courseId: string
  courseCode: string
  courseName: string
}

export type OverviewRecentQuestion = {
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

export type PlatformOverview = {
  stats: PlatformStats
  recentResources: OverviewRecentResource[]
  recentQuestions: OverviewRecentQuestion[]
}

export function formatActivityCounter(count: number): string {
  return new Intl.NumberFormat("en-US").format(count)
}

export function getOverviewEmptyState(stats: PlatformStats): {
  hasActivity: boolean
  title: string
  description: string
} {
  const hasActivity =
    stats.totalResources > 0 ||
    stats.totalQuestions > 0 ||
    stats.activeCourses > 0

  if (!hasActivity) {
    return {
      hasActivity: false,
      title: "Welcome to the University Academic Hub",
      description:
        "Be the first to share a course resource or ask an academic question to get the community started.",
    }
  }

  return {
    hasActivity: true,
    title: "Academic Resource Sharing &amp; Course Q&amp;A",
    description:
      "Explore academic resources, course questions, and peer answers across your university.",
  }
}

export function getRecentResourcesEmptyState(): {
  title: string
  description: string
} {
  return {
    title: "No resources uploaded yet",
    description:
      "Share exam papers, notes, or slides with students from your courses.",
  }
}

export function getRecentQuestionsEmptyState(): {
  title: string
  description: string
} {
  return {
    title: "No questions asked yet",
    description:
      "Start the first academic question or discussion about your coursework.",
  }
}

const API_URL = process.env.API_URL || "http://localhost:8787"

function overviewBaseUrl(): string {
  if (typeof window !== "undefined") {
    return ""
  }
  return API_URL
}

export const DEFAULT_PLATFORM_OVERVIEW: PlatformOverview = {
  stats: {
    totalResources: 0,
    totalQuestions: 0,
    activeCourses: 0,
  },
  recentResources: [],
  recentQuestions: [],
}

export async function fetchPlatformOverview(
  customUrl?: string
): Promise<PlatformOverview> {
  const url = customUrl || `${overviewBaseUrl()}/api/overview`
  try {
    const res = await fetch(url, {
      cache: "no-store",
    })
    if (!res.ok) {
      return DEFAULT_PLATFORM_OVERVIEW
    }
    const data = (await res.json()) as PlatformOverview
    return {
      stats: {
        totalResources: Number(data?.stats?.totalResources ?? 0),
        totalQuestions: Number(data?.stats?.totalQuestions ?? 0),
        activeCourses: Number(data?.stats?.activeCourses ?? 0),
      },
      recentResources: Array.isArray(data?.recentResources)
        ? data.recentResources
        : [],
      recentQuestions: Array.isArray(data?.recentQuestions)
        ? data.recentQuestions
        : [],
    }
  } catch {
    return DEFAULT_PLATFORM_OVERVIEW
  }
}
