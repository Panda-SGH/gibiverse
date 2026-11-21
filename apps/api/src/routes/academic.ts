import { Hono } from "hono"
import { and, eq, type SQL } from "drizzle-orm"
import db from "../db/index.js"
import { university, department, course } from "../db/schema/academic.js"

const academic = new Hono()
  .get("/universities", async (c) => {
    const rows = await db
      .select({
        id: university.id,
        name: university.name,
      })
      .from(university)
      .orderBy(university.name)

    return c.json(rows)
  })
  .get("/departments", async (c) => {
    const universityId = c.req.query("universityId")

    const query = db
      .select({
        id: department.id,
        name: department.name,
        universityId: department.universityId,
      })
      .from(department)
      .orderBy(department.name)

    const rows = universityId
      ? await query.where(eq(department.universityId, universityId))
      : await query

    return c.json(rows)
  })
  .get("/courses", async (c) => {
    const universityId = c.req.query("universityId")
    const departmentId = c.req.query("departmentId")

    const conditions: SQL[] = []
    if (universityId) {
      conditions.push(eq(course.universityId, universityId))
    }
    if (departmentId) {
      conditions.push(eq(course.departmentId, departmentId))
    }

    const query = db
      .select({
        id: course.id,
        name: course.name,
        code: course.code,
        universityId: course.universityId,
        departmentId: course.departmentId,
      })
      .from(course)
      .orderBy(course.code)

    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query

    return c.json(rows)
  })

export { academic }
