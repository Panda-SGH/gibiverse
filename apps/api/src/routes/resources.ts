import { Hono, type Context } from "hono"
import { zValidator } from "@hono/zod-validator"
import {
  listResourcesQuerySchema,
  uploadResourceSchema,
} from "@gibiverse/shared/validation"
import db from "../db/index.js"
import { statusFor } from "../lib/result.js"
import { requireAuth } from "../middleware/auth.js"
import { createResources } from "../resources/index.js"
import { createStorage } from "../storage/index.js"

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

const resources = new Hono()
  .get("/", async (c) => {
    const queryValidation = listResourcesQuerySchema.safeParse({
      resourceType: c.req.query("resourceType")?.trim() || undefined,
      departmentId: c.req.query("departmentId")?.trim() || undefined,
      courseId: c.req.query("courseId")?.trim() || undefined,
    })

    if (!queryValidation.success) {
      return c.json(
        { error: queryValidation.error.issues[0]?.message ?? "Invalid query" },
        400
      )
    }

    const { resourceType, departmentId, courseId } = queryValidation.data

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
  .get("/:id/download", async (c) => streamResourceFile(c, "attachment"))
  .get("/:id/preview", async (c) => streamResourceFile(c, "inline"))
  .get("/:id", async (c) => {
    const id = c.req.param("id")
    const result = await resourceModule.get(id)

    if (!result.ok) {
      return c.json({ error: result.error.message }, statusFor(result.error))
    }

    return c.json(result.data)
  })
  .post(
    "/",
    requireAuth,
    zValidator("form", uploadResourceSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          { error: result.error.issues[0]?.message ?? "Invalid upload" },
          400
        )
      }
    }),
    async (c) => {
      const user = c.get("user")
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const {
        title,
        courseId,
        resourceType,
        year,
        semester,
        description,
        file,
      } = c.req.valid("form")

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
    }
  )

export { resources }
