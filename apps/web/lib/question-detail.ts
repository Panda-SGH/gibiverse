export interface AnswerItem {
  id: string
  body: string
  questionId: string
  studentId: string
  studentName: string
  voteScore: number
  isAccepted: boolean
  createdAt: string
  updatedAt: string
}

export interface QuestionDetail {
  id: string
  title: string
  body: string
  courseId: string
  courseCode: string
  courseName: string
  studentId: string
  studentName: string
  voteScore: number
  answerCount: number
  acceptedAnswerId: string | null
  createdAt: string
  updatedAt: string
  answers: AnswerItem[]
}

export function canAcceptAnswer(
  questionAuthorId?: string | null,
  currentUserId?: string | null
): boolean {
  if (!questionAuthorId || !currentUserId) {
    return false
  }
  return questionAuthorId.trim() === currentUserId.trim()
}

export function isAnswerAccepted(
  acceptedAnswerId: string | null | undefined,
  answerId: string
): boolean {
  if (!acceptedAnswerId || !answerId) {
    return false
  }
  return acceptedAnswerId === answerId
}

export function validateAnswerSubmission(body: string): {
  valid: boolean
  error?: string
  body?: string
} {
  const trimmed = (body || "").trim()
  if (!trimmed) {
    return {
      valid: false,
      error: "Answer body cannot be empty",
    }
  }
  return {
    valid: true,
    body: trimmed,
  }
}

export function formatDetailDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const API_URL = process.env.API_URL || "http://localhost:8787"

export async function getQuestion(id: string): Promise<QuestionDetail | null> {
  const url = `${API_URL}/api/questions/${encodeURIComponent(id)}`
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (res.status === 404) return null
    if (!res.ok) {
      return null
    }
    return (await res.json()) as QuestionDetail
  } catch {
    return null
  }
}
