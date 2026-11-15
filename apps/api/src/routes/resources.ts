import { Hono, type Context } from "hono"
import db from "../db/index.js"
import { statusFor } from "../lib/result.js"
import { requireAuth } from "../middleware/auth.js"
import { createResources } from "../resources/index.js"
import { createStorage } from "../storage/index.js"

const resources = new Hono()
const resourceModule = createResources({ db, storage: createStorage() })

function contentDisposition(
  disposition: "inline" | "attachment",
  fileName: string
): string {
  const escaped = fileName.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  return `${disposition}; filename="${escaped}"`
}

async function streamResourceFile(
  c: Context,
  disposition: "inline" | "attachment"
) {
  const id = c.req.param("id")
  const result = await resourceModule.stream(id)

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  c.header("Content-Type", result.data.contentType)
  c.header(
    "Content-Disposition",
    contentDisposition(disposition, result.data.fileName)
  )
  c.header("Content-Length", String(result.data.size))
  return c.body(result.data.stream)
}

resources.get("/", async (c) => {
  const resourceType = c.req.query("resourceType")?.trim() || undefined
  const departmentId = c.req.query("departmentId")?.trim() || undefined
  const courseId = c.req.query("courseId")?.trim() || undefined

  const result = await resourceModule.list({
    resourceType,
    departmentId,
    courseId,
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data)
})

resources.get("/:id/download", async (c) => streamResourceFile(c, "attachment"))

resources.get("/:id/preview", async (c) => streamResourceFile(c, "inline"))

resources.get("/:id", async (c) => {
  const id = c.req.param("id")
  const result = await resourceModule.get(id)

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data)
})

resources.post("/", requireAuth, async (c) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const body = await c.req.parseBody()
  const file = body["file"]

  if (!(file instanceof File)) {
    return c.json({ error: "File is required" }, 400)
  }

  const title = typeof body["title"] === "string" ? body["title"] : ""
  const courseId = typeof body["courseId"] === "string" ? body["courseId"] : ""
  const resourceType =
    typeof body["resourceType"] === "string" ? body["resourceType"] : ""
  const yearRaw = typeof body["year"] === "string" ? body["year"] : ""
  const semester = typeof body["semester"] === "string" ? body["semester"] : ""
  const description =
    typeof body["description"] === "string" && body["description"].trim()
      ? body["description"].trim()
      : null

  const year = Number.parseInt(yearRaw, 10)
  const data = Buffer.from(await file.arrayBuffer())

  const result = await resourceModule.upload({
    student: { id: user.id, name: user.name },
    title,
    courseId,
    resourceType,
    year,
    semester,
    description,
    file: { name: file.name, size: file.size, type: file.type, data },
  })

  if (!result.ok) {
    return c.json({ error: result.error.message }, statusFor(result.error))
  }

  return c.json(result.data, 201)
})

export { resources }
