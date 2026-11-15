export type PlatformStats = {
  totalResources: number
  totalQuestions: number
  activeCourses: number
}

export const DEFAULT_PLATFORM_OVERVIEW = {
  stats: {
    totalResources: 0,
    totalQuestions: 0,
    activeCourses: 0,
  },
  recentResources: [],
  recentQuestions: [],
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
