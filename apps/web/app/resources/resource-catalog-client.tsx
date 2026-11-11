"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@gibiverse/ui/components/badge"
import { Button } from "@gibiverse/ui/components/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@gibiverse/ui/components/toggle-group"
import { CoursePicker } from "@/components/course-picker"
import type { Course, Department } from "@/lib/academic"
import {
  catalogEmptyState,
  formatAcademicPeriod,
  formatRelativeUploadDate,
  hasActiveCatalogFilters,
  listResources,
  type CatalogFilters,
  type CatalogResource,
} from "@/lib/resource-catalog"
import { resourceTypeOptions } from "@/lib/resource-options"
import type { ResourceType } from "@/lib/resource-validation"

const TYPE_PILL_LABELS: Record<ResourceType, string> = {
  exam: "Exam",
  notes: "Notes",
  slides: "Slides",
  assignment: "Assignment",
  lab: "Lab",
  other: "Other",
}

export function ResourceCatalogClient({
  departments,
  courses,
  initialResources,
}: {
  departments: Department[]
  courses: Course[]
  initialResources: CatalogResource[]
}) {
  const [filters, setFilters] = React.useState<CatalogFilters>({
    resourceType: null,
    departmentId: null,
    courseId: null,
  })
  const [resources, setResources] =
    React.useState<CatalogResource[]>(initialResources)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const isFirstRender = React.useRef(true)

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    listResources(filters)
      .then((next) => {
        if (!cancelled) setResources(next)
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load resources. Please try again.")
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters])

  const emptyState = catalogEmptyState(filters)
  const typeValue = filters.resourceType ? [filters.resourceType] : []

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4" aria-labelledby="filters-heading">
        <div>
          <h2
            id="filters-heading"
            className="text-lg font-semibold text-foreground"
          >
            Filter resources
          </h2>
          <p className="text-sm text-muted-foreground">
            Narrow by resource type, department, or course.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Resource type</p>
          <ToggleGroup
            variant="outline"
            size="sm"
            spacing={2}
            value={typeValue}
            onValueChange={(next) => {
              const selected = next[0]
              const match = resourceTypeOptions.find(
                (option) => option.value === selected
              )
              setFilters((prev) => ({
                ...prev,
                resourceType: match?.value ?? null,
              }))
            }}
            className="flex max-w-full flex-wrap"
            aria-label="Filter by resource type"
            data-testid="resource-type-filters"
          >
            {resourceTypeOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
              >
                {TYPE_PILL_LABELS[option.value]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <CoursePicker
          departments={departments}
          courses={courses}
          departmentId={filters.departmentId}
          courseId={filters.courseId}
          allowClear
          onDepartmentChange={(departmentId) =>
            setFilters((prev) => ({
              ...prev,
              departmentId,
              courseId: null,
            }))
          }
          onCourseChange={(courseId) =>
            setFilters((prev) => ({ ...prev, courseId }))
          }
        />
      </section>

      <section
        className="flex flex-col gap-4"
        aria-labelledby="catalog-heading"
        aria-busy={isLoading}
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="catalog-heading"
            className="text-lg font-semibold text-foreground"
          >
            Resources
          </h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Updating…</p>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {resources.length === 0 ? (
          <div
            className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-6 py-10"
            data-testid="resources-empty-state"
          >
            <h3 className="text-base font-semibold text-foreground">
              {emptyState.title}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {emptyState.description}
            </p>
            {hasActiveCatalogFilters(filters) ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    resourceType: null,
                    departmentId: null,
                    courseId: null,
                  })
                }
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="resources-grid"
          >
            {resources.map((resource) => (
              <li key={resource.id}>
                <Link
                  href={`/resources/${resource.id}`}
                  className="flex h-full flex-col gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  data-testid={`resource-card-${resource.id}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{resource.courseCode}</Badge>
                    <Badge variant="outline">
                      {TYPE_PILL_LABELS[resource.resourceType] ??
                        resource.resourceType}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {resource.title}
                  </h3>
                  <p className="mt-auto text-sm text-muted-foreground">
                    {formatAcademicPeriod(resource.year, resource.semester)}
                    <span aria-hidden="true"> · </span>
                    <time dateTime={resource.createdAt}>
                      {formatRelativeUploadDate(resource.createdAt)}
                    </time>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
