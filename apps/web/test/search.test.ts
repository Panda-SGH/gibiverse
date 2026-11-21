import test from "node:test"
import assert from "node:assert/strict"
import {
  buildSearchPageUrl,
  buildSearchQuery,
  getSearchEmptyState,
  emptySearchResponse,
} from "../app/search/presentation.js"

test("buildSearchQuery formats url and query params correctly", () => {
  assert.equal(buildSearchQuery(""), "/api/search")
  assert.equal(buildSearchQuery("   "), "/api/search")
  assert.equal(buildSearchQuery("cs101"), "/api/search?q=cs101")
  assert.equal(
    buildSearchQuery("quantum physics", "all"),
    "/api/search?q=quantum+physics"
  )
  assert.equal(
    buildSearchQuery("algorithms", "resources"),
    "/api/search?q=algorithms&type=resources"
  )
  assert.equal(
    buildSearchQuery("data structures", "questions"),
    "/api/search?q=data+structures&type=questions"
  )
})

test("buildSearchPageUrl formats frontend page routes without /api", () => {
  assert.equal(buildSearchPageUrl(""), "/search")
  assert.equal(buildSearchPageUrl("   "), "/search")
  assert.equal(buildSearchPageUrl("", "resources"), "/search?type=resources")
  assert.equal(buildSearchPageUrl("cs101"), "/search?q=cs101")
  assert.equal(
    buildSearchPageUrl("quantum physics", "all"),
    "/search?q=quantum+physics"
  )
  assert.equal(
    buildSearchPageUrl("algorithms", "resources"),
    "/search?q=algorithms&type=resources"
  )
})

test("getSearchEmptyState handles empty and non-empty queries across tabs", () => {
  const initial = getSearchEmptyState("", "all")
  assert.equal(initial.title, "Search Gibiverse")
  assert.match(initial.description, /course code/)

  const noMatchAll = getSearchEmptyState("xyz123", "all")
  assert.equal(noMatchAll.title, 'No results found')
  assert.match(noMatchAll.description, /xyz123/)

  const noMatchResources = getSearchEmptyState("xyz123", "resources")
  assert.equal(noMatchResources.title, 'No course materials found')
  assert.match(noMatchResources.description, /xyz123/)

  const noMatchQuestions = getSearchEmptyState("xyz123", "questions")
  assert.equal(noMatchQuestions.title, 'No questions found')
  assert.match(noMatchQuestions.description, /xyz123/)
})

test("emptySearchResponse returns zeroed response without network fetch for empty query", () => {
  const result = emptySearchResponse("resources")
  assert.equal(result.query, "")
  assert.equal(result.type, "resources")
  assert.deepEqual(result.counts, { all: 0, resources: 0, questions: 0 })
  assert.deepEqual(result.resources, [])
  assert.deepEqual(result.questions, [])

  const platformResult = emptySearchResponse("questions")
  assert.equal(platformResult.query, "")
  assert.equal(platformResult.type, "questions")
  assert.deepEqual(platformResult.counts, { all: 0, resources: 0, questions: 0 })
})
