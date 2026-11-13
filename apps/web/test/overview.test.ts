import test from "node:test"
import assert from "node:assert/strict"
import {
  formatActivityCounter,
  getOverviewEmptyState,
  getRecentResourcesEmptyState,
  getRecentQuestionsEmptyState,
  fetchPlatformOverview,
  type PlatformOverview,
} from "../lib/overview.js"

test("formatActivityCounter formats numbers with localized grouping", () => {
  assert.equal(formatActivityCounter(0), "0")
  assert.equal(formatActivityCounter(42), "42")
  assert.equal(formatActivityCounter(1250), "1,250")
  assert.equal(formatActivityCounter(1000000), "1,000,000")
})

test("getOverviewEmptyState distinguishes empty platforms from active ones", () => {
  const emptyState = getOverviewEmptyState({
    totalResources: 0,
    totalQuestions: 0,
    activeCourses: 0,
  })
  assert.equal(emptyState.hasActivity, false)
  assert.match(emptyState.title, /welcome/i)
  assert.match(emptyState.description, /first to share|community/i)

  const activeState = getOverviewEmptyState({
    totalResources: 12,
    totalQuestions: 5,
    activeCourses: 3,
  })
  assert.equal(activeState.hasActivity, true)
})

test("getRecentResourcesEmptyState and getRecentQuestionsEmptyState guide students", () => {
  const resEmpty = getRecentResourcesEmptyState()
  assert.match(resEmpty.title, /no resources/i)
  assert.match(resEmpty.description, /share|upload/i)

  const qEmpty = getRecentQuestionsEmptyState()
  assert.match(qEmpty.title, /no questions/i)
  assert.match(qEmpty.description, /first.*question|discussion/i)
})

test("fetchPlatformOverview falls back safely on network failure without throwing", async () => {
  // Pass an invalid URL to ensure fallback behavior is resilient
  const fallback = await fetchPlatformOverview("http://127.0.0.1:59999/api/overview")
  assert.deepEqual(fallback.stats, {
    totalResources: 0,
    totalQuestions: 0,
    activeCourses: 0,
  })
  assert.deepEqual(fallback.recentResources, [])
  assert.deepEqual(fallback.recentQuestions, [])
})

test("fetchPlatformOverview returns parsed JSON payload when response is ok", async () => {
  const mockPayload: PlatformOverview = {
    stats: {
      totalResources: 34,
      totalQuestions: 18,
      activeCourses: 7,
    },
    recentResources: [
      {
        id: "res-1",
        title: "Calculus Exam Solutions",
        resourceType: "exam",
        year: 2024,
        semester: "1",
        createdAt: "2026-11-13T08:00:00.000Z",
        courseId: "c-1",
        courseCode: "MATH101",
        courseName: "Calculus I",
      },
    ],
    recentQuestions: [
      {
        id: "q-1",
        title: "Integration by parts formula",
        body: "What is the best way to choose u and dv?",
        createdAt: "2026-11-13T09:00:00.000Z",
        courseId: "c-1",
        courseCode: "MATH101",
        courseName: "Calculus I",
        studentId: "s-1",
        studentName: "Ada Lovelace",
        voteScore: 4,
        answerCount: 2,
      },
    ],
  }

  // Intercept global fetch for test
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(JSON.stringify(mockPayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

  try {
    const result = await fetchPlatformOverview("https://example.com/api/overview")
    assert.deepEqual(result.stats, mockPayload.stats)
    assert.equal(result.recentResources.length, 1)
    assert.equal(result.recentResources[0]?.title, "Calculus Exam Solutions")
    assert.equal(result.recentQuestions.length, 1)
    assert.equal(result.recentQuestions[0]?.studentName, "Ada Lovelace")
  } finally {
    globalThis.fetch = originalFetch
  }
})
