import { Hono } from "hono"
import { eq } from "drizzle-orm"
import db from "../db/index.js"
import { university, department, course } from "../db/schema/academic.js"

const academic = new Hono()

academic.get("/universities", async (c) => {
  const rows = await db
    .select({
      id: university.id,
      name: university.name,
    })
    .from(university)
    .orderBy(university.name)

  return c.json(rows)
})

academic.get("/departments", async (c) => {
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

academic.get("/courses", async (c) => {
  const departmentId = c.req.query("departmentId")

  const query = db
    .select({
      id: course.id,
      name: course.name,
      code: course.code,
      departmentId: course.departmentId,
    })
    .from(course)
    .orderBy(course.code)

  const rows = departmentId
    ? await query.where(eq(course.departmentId, departmentId))
    : await query

  return c.json(rows)
})

export { academic }
