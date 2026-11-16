import test from "node:test"
import assert from "node:assert/strict"

test("subpath export ./types resolves and provides type definitions", async () => {
  const typesModule = await import("@gibiverse/shared/types")
  assert.ok(typesModule, "types module should resolve")
  assert.equal(typeof typesModule, "object")
})

test("subpath export ./validation resolves and provides validation schemas", async () => {
  const validationModule = await import("@gibiverse/shared/validation")
  assert.ok(validationModule, "validation module should resolve")
  assert.ok(
    validationModule.academicPeriodSchema,
    "academicPeriodSchema should be exported"
  )
  assert.ok(
    validationModule.semesterSchema,
    "semesterSchema should be exported"
  )

  // Verify runtime schema behavior
  const valid = validationModule.academicPeriodSchema.safeParse({
    year: 2026,
    semester: 1,
  })
  assert.equal(valid.success, true)
  const invalid = validationModule.academicPeriodSchema.safeParse({
    year: 1990,
    semester: "invalid",
  })
  assert.equal(invalid.success, false)
})

test("subpath export ./utils resolves and provides domain utilities", async () => {
  const utilsModule = await import("@gibiverse/shared/utils")
  assert.ok(utilsModule, "utils module should resolve")
  assert.equal(typeof utilsModule.formatAcademicPeriod, "function")

  // Test with object parameter (Data Clump refactored)
  assert.equal(
    utilsModule.formatAcademicPeriod({ year: 2026, semester: 1 }),
    "2026 - Semester 1"
  )
  // Test with separate arguments overload
  assert.equal(
    utilsModule.formatAcademicPeriod(2026, "summer"),
    "2026 - Summer"
  )
})
