import test from "node:test"
import assert from "node:assert/strict"
import {
  RESOURCE_TYPES,
  SEMESTERS,
  resourceTypeSchema,
  semesterSchema,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MIN_ACADEMIC_YEAR,
  MAX_ACADEMIC_YEAR,
  resourceTypePillLabels,
  resourceTypeOptions,
  semesterOptions,
  yearOptions,
} from "../src/types/resource.js"
import { formatBytes } from "../src/utils/resource.js"
import { validateFile } from "../src/validation/resource.js"

test("RESOURCE_TYPES and SEMESTERS contain domain values", () => {
  assert.deepEqual(RESOURCE_TYPES, [
    "exam",
    "notes",
    "slides",
    "assignment",
    "lab",
    "other",
  ])
  assert.deepEqual(SEMESTERS, ["1", "2", "summer"])
})

test("resourceTypeSchema validates valid resource types and rejects invalid", () => {
  for (const type of RESOURCE_TYPES) {
    const parsed = resourceTypeSchema.safeParse(type)
    assert.equal(parsed.success, true)
  }
  const invalid = resourceTypeSchema.safeParse("textbook")
  assert.equal(invalid.success, false)
})

test("semesterSchema validates valid semesters and rejects invalid", () => {
  for (const sem of SEMESTERS) {
    const parsed = semesterSchema.safeParse(sem)
    assert.equal(parsed.success, true)
  }
  const invalid = semesterSchema.safeParse("fall")
  assert.equal(invalid.success, false)
})

test("file constants and academic year limits have expected values", () => {
  assert.equal(MAX_FILE_SIZE_MB, 50)
  assert.equal(MAX_FILE_SIZE_BYTES, 50 * 1024 * 1024)
  assert.equal(MIN_ACADEMIC_YEAR, 2000)
  assert.equal(MAX_ACADEMIC_YEAR, 2100)
  assert.ok(ALLOWED_EXTENSIONS.includes(".pdf"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".docx"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".pptx"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".png"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".jpg"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".jpeg"))
  assert.ok(ALLOWED_EXTENSIONS.includes(".webp"))
  assert.ok(ALLOWED_MIME_TYPES.includes("application/pdf"))
  assert.ok(
    ALLOWED_MIME_TYPES.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  )
})

test("catalog options and labels are defined correctly", () => {
  assert.equal(resourceTypePillLabels.exam, "Exam")
  assert.equal(resourceTypePillLabels.notes, "Notes")
  assert.equal(resourceTypePillLabels.slides, "Slides")
  assert.equal(resourceTypePillLabels.assignment, "Assignment")
  assert.equal(resourceTypePillLabels.lab, "Lab")
  assert.equal(resourceTypePillLabels.other, "Other")

  assert.equal(resourceTypeOptions.length, 6)
  assert.deepEqual(
    resourceTypeOptions.map((o) => o.value),
    [...RESOURCE_TYPES]
  )

  assert.equal(semesterOptions.length, 3)
  assert.deepEqual(
    semesterOptions.map((o) => o.value),
    [...SEMESTERS]
  )

  const fixedDate = new Date(2026, 0, 1)
  const years = yearOptions(fixedDate)
  assert.equal(years.length, 8)
  assert.equal(years[0], 2026)
  assert.equal(years[7], 2019)
})

test("formatBytes formats byte numbers accurately", () => {
  assert.equal(formatBytes(0), "0 B")
  assert.equal(formatBytes(1024), "1 KB")
  assert.equal(formatBytes(50 * 1024 * 1024), "50 MB")
})

test("validateFile validates file size, empty files, and allowed formats", () => {
  // Empty file
  const emptyRes = validateFile({
    name: "notes.pdf",
    size: 0,
    type: "application/pdf",
  })
  assert.equal(emptyRes.valid, false)
  assert.match(emptyRes.error ?? "", /empty/i)

  // Oversized file
  const overRes = validateFile({
    name: "huge.pdf",
    size: MAX_FILE_SIZE_BYTES + 1,
    type: "application/pdf",
  })
  assert.equal(overRes.valid, false)
  assert.match(
    overRes.error ?? "",
    /exceeds the maximum allowed limit of 50 MB/i
  )

  // Disallowed format
  const exeRes = validateFile({
    name: "virus.exe",
    size: 1024,
    type: "application/x-msdownload",
  })
  assert.equal(exeRes.valid, false)
  assert.match(exeRes.error ?? "", /unsupported format/i)

  // Allowed formats
  const allowedCases = [
    { name: "test.pdf", type: "application/pdf" },
    {
      name: "test.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      name: "test.pptx",
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    { name: "test.png", type: "image/png" },
    { name: "test.jpg", type: "image/jpeg" },
    { name: "test.jpeg", type: "image/jpeg" },
    { name: "test.webp", type: "image/webp" },
  ]
  for (const c of allowedCases) {
    const res = validateFile({ ...c, size: 2048 })
    assert.equal(res.valid, true, `Expected ${c.name} to be valid`)
  }
})
