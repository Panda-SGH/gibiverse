import { Hono } from "hono"
import db from "../db/index.js"
import { parseJsonBody } from "../lib/json.js"
import { requireAuth, optionalAuth } from "../middleware/auth.js"
import { createQa, type QuestionSort, type QaError } from "../qa/index.js"

const questions = new Hono()
const qa = createQa({ db })

const SORT_OPTIONS = ["newest", "most_voted", "unanswered"] as const

function isQuestionSort(value: string): value is QuestionSort {
  return (SORT_OPTIONS as readonly string[]).includes(value)
}

function studentFromUser(
  user: { id: string; name: string } | null | undefined
) {
  if (!user) return null
  return { id: user.id, name: user.name }
}

function statusFor(error: QaError): 400 | 403 | 404 {
  if (error.code === "not_found") return 404
  if (error.code === "forbidden") return 403
  return 400
}

questions.get("/", optionalAuth, async (c) => {
  const user = c.get("user")
  const courseId = c.req.query("courseId")?.trim() || undefined
  const departmentId = c.req.query("departmentId")?.trim() || undefined
  const sortRaw = c.req.query("sort")?.trim() || "newest"

  if (!isQuestionSort(sortRaw)) {
    return c.json({ error: "Invalid sort" }, 400)
  }

  const result = await qa.list({
    student: studentFromUser(user),
    filters: { courseId, departmentId, sort: sortRaw },
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data)
})

questions.get("/:id", optionalAuth, async (c) => {
  const user = c.get("user")
  const questionId = c.req.param("id")

  const result = await qa.get({
    student: studentFromUser(user),
    questionId,
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data)
})

questions.post("/", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const result = await qa.ask({
    student: { id: user.id, name: user.name },
    title: typeof raw.title === "string" ? raw.title : "",
    body: typeof raw.body === "string" ? raw.body : "",
    courseId: typeof raw.courseId === "string" ? raw.courseId : "",
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data, 201)
})

questions.post("/:id/answers", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const questionId = c.req.param("id")
  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const result = await qa.answer({
    student: { id: user.id, name: user.name },
    questionId,
    body: typeof raw.body === "string" ? raw.body : "",
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data, 201)
})

questions.post("/:id/accept", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const questionId = c.req.param("id")
  const raw = await parseJsonBody(c)
  if (!raw) {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const answerId =
    typeof raw.answerId === "string" ? raw.answerId : null

  const result = await qa.accept({
    student: { id: user.id, name: user.name },
    questionId,
    answerId,
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data, 200)
})

export { questions }
