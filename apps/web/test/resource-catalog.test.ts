import test from "node:test"
import assert from "node:assert/strict"
import {
  buildResourcesQuery,
  catalogEmptyState,
  formatAcademicPeriod,
  formatRelativeUploadDate,
  type CatalogFilters,
} from "../lib/resource-catalog.js"

test("formatAcademicPeriod renders year and semester label", () => {
  assert.strictEqual(formatAcademicPeriod(2024, "1"), "2024 · Semester 1")
  assert.strictEqual(formatAcademicPeriod(2023, "2"), "2023 · Semester 2")
  assert.strictEqual(formatAcademicPeriod(2025, "summer"), "2025 · Summer")
})

test("formatRelativeUploadDate uses relative phrasing from a fixed now", () => {
  const now = new Date("2026-11-11T12:00:00.000Z")
  assert.strictEqual(
    formatRelativeUploadDate("2026-11-11T11:00:00.000Z", now),
    "1 hour ago"
  )
  assert.strictEqual(
    formatRelativeUploadDate("2026-11-10T12:00:00.000Z", now),
    "1 day ago"
  )
  assert.strictEqual(
    formatRelativeUploadDate("2026-11-04T12:00:00.000Z", now),
    "7 days ago"
  )
})

test("catalogEmptyState guides clearing filters when filters are active", () => {
  const filters: CatalogFilters = {
    resourceType: "exam",
    departmentId: null,
    courseId: null,
  }
  const state = catalogEmptyState(filters)
  assert.match(state.title, /no resources/i)
  assert.match(state.description, /clear|adjust|filters/i)
})

test("catalogEmptyState prompts upload when catalog is empty without filters", () => {
  const filters: CatalogFilters = {
    resourceType: null,
    departmentId: null,
    courseId: null,
  }
  const state = catalogEmptyState(filters)
  assert.match(state.title, /no resources/i)
  assert.match(state.description, /upload/i)
})

test("buildResourcesQuery encodes active catalog filters", () => {
  assert.strictEqual(
    buildResourcesQuery({
      resourceType: null,
      departmentId: null,
      courseId: null,
    }),
    "/api/resources"
  )
  assert.strictEqual(
    buildResourcesQuery({
      resourceType: "exam",
      departmentId: "dept_cs",
      courseId: "course_1",
    }),
    "/api/resources?resourceType=exam&departmentId=dept_cs&courseId=course_1"
  )
})
