import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { app } from "../src/app.js"
import db from "../src/db/index.js"
import { university, department, course } from "../src/db/schema/academic.js"
import { eq } from "drizzle-orm"

const suffix = Date.now()
const uniId = `uni_test_${suffix}`
const otherUniId = `uni_other_${suffix}`
const deptId = `dept_test_${suffix}`
const otherDeptId = `dept_other_${suffix}`
const courseId = `course_test_${suffix}`
const otherCourseId = `course_other_${suffix}`
const courseCode = `CS${String(suffix).slice(-3)}`
const otherCourseCode = `MA${String(suffix).slice(-3)}`

before(async () => {
  await db.insert(university).values([
    { id: uniId, name: `Test University ${suffix}` },
    { id: otherUniId, name: `Other University ${suffix}` },
  ])
  await db.insert(department).values([
    {
      id: deptId,
      name: `Computer Science ${suffix}`,
      universityId: uniId,
    },
    {
      id: otherDeptId,
      name: `Mathematics ${suffix}`,
      universityId: otherUniId,
    },
  ])
  await db.insert(course).values([
    {
      id: courseId,
      name: "Data Structures",
      code: courseCode,
      universityId: uniId,
      departmentId: deptId,
    },
    {
      id: otherCourseId,
      name: "Calculus I",
      code: otherCourseCode,
      universityId: otherUniId,
      departmentId: otherDeptId,
    },
  ])
})

after(async () => {
  await db.delete(course).where(eq(course.id, courseId))
  await db.delete(course).where(eq(course.id, otherCourseId))
  await db.delete(department).where(eq(department.id, deptId))
  await db.delete(department).where(eq(department.id, otherDeptId))
  await db.delete(university).where(eq(university.id, uniId))
  await db.delete(university).where(eq(university.id, otherUniId))
})

test("GET /api/universities lists universities", async () => {
  const res = await app.request("/api/universities")
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as Array<{ id: string; name: string }>
  assert.ok(Array.isArray(body))
  const match = body.find((u) => u.id === uniId)
  assert.ok(match, "Seeded university should appear in listing")
  assert.strictEqual(match.name, `Test University ${suffix}`)
})

test("GET /api/departments filters by universityId", async () => {
  const res = await app.request(`/api/departments?universityId=${uniId}`)
  assert.strictEqual(res.status, 200)
  const body = (await res.json()) as Array<{
    id: string
    name: string
    universityId: string
  }>
  assert.ok(body.some((d) => d.id === deptId))
  assert.ok(body.every((d) => d.universityId === uniId))
  assert.ok(!body.some((d) => d.id === otherDeptId))
})

test("GET /api/courses filters by departmentId and universityId", async () => {
  const deptRes = await app.request(`/api/courses?departmentId=${deptId}`)
  assert.strictEqual(deptRes.status, 200)
  const deptBody = (await deptRes.json()) as Array<{
    id: string
    name: string
    code: string
    universityId: string
    departmentId: string
  }>
  assert.ok(deptBody.some((c) => c.id === courseId && c.code === courseCode))
  assert.ok(deptBody.every((c) => c.departmentId === deptId))
  assert.ok(!deptBody.some((c) => c.id === otherCourseId))

  const uniRes = await app.request(`/api/courses?universityId=${uniId}`)
  assert.strictEqual(uniRes.status, 200)
  const uniBody = (await uniRes.json()) as Array<{
    id: string
    name: string
    code: string
    universityId: string
    departmentId: string
  }>
  assert.ok(uniBody.some((c) => c.id === courseId && c.code === courseCode))
  assert.ok(uniBody.every((c) => c.universityId === uniId))
  assert.ok(!uniBody.some((c) => c.id === otherCourseId))
})

function pgErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  const cause = (err as Error & { cause?: unknown }).cause
  if (cause instanceof Error) return `${err.message}\n${cause.message}`
  return err.message
}

test("course code must be unique", async () => {
  await assert.rejects(
    () =>
      db.insert(course).values({
        id: `course_dup_${suffix}`,
        name: "Duplicate Code Course",
        code: courseCode,
        universityId: uniId,
        departmentId: deptId,
      }),
    (err: unknown) => /unique|duplicate/i.test(pgErrorMessage(err))
  )
})

test("department requires a valid university foreign key", async () => {
  await assert.rejects(
    () =>
      db.insert(department).values({
        id: `dept_orphan_${suffix}`,
        name: "Orphan Department",
        universityId: `missing_uni_${suffix}`,
      }),
    (err: unknown) => /foreign key|violates/i.test(pgErrorMessage(err))
  )
})

test("course requires a valid university foreign key", async () => {
  await assert.rejects(
    () =>
      db.insert(course).values({
        id: `course_uni_orphan_${suffix}`,
        name: "Orphan Course Uni",
        code: `OU${String(suffix).slice(-3)}`,
        universityId: `missing_uni_${suffix}`,
        departmentId: deptId,
      }),
    (err: unknown) => /foreign key|violates/i.test(pgErrorMessage(err))
  )
})

test("course requires a valid department foreign key", async () => {
  await assert.rejects(
    () =>
      db.insert(course).values({
        id: `course_orphan_${suffix}`,
        name: "Orphan Course",
        code: `OR${String(suffix).slice(-3)}`,
        universityId: uniId,
        departmentId: `missing_dept_${suffix}`,
      }),
    (err: unknown) => /foreign key|violates/i.test(pgErrorMessage(err))
  )
})
