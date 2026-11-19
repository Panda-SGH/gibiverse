"use client"

import * as React from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@gibiverse/ui/lib/utils"
import { Button } from "@gibiverse/ui/components/button"
import { Label } from "@gibiverse/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gibiverse/ui/components/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@gibiverse/ui/components/toggle-group"
import { client } from "@gibiverse/api-client"
import type { Course, Department } from "@/app/courses/presentation"
import { filterCoursesByDepartment } from "@/app/courses/presentation"
import {
  catalogEmptyState,
  hasActiveCatalogFilters,
  type CatalogFilters,
  type CatalogResource,
} from "./presentation"
import {
  resourceTypeOptions,
  resourceTypePillLabels,
} from "@gibiverse/shared/types"
import { PrototypeSwitcher } from "@/components/prototype-switcher"
import { VariantA, VariantB, VariantC, VariantD } from "./catalog-card-variants"

const ALL_VALUE = "__all__"
const ALL_TYPE_KEY = "__all_types__"

const ACTIVE_TOGGLE_CLASSES =
  "aria-pressed:bg-emerald-50 aria-pressed:text-emerald-700 aria-pressed:border-emerald-600/30 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-600/30 dark:aria-pressed:bg-emerald-950/40 dark:aria-pressed:text-emerald-400 dark:aria-pressed:border-emerald-500/30 dark:data-[state=on]:bg-emerald-950/40 dark:data-[state=on]:text-emerald-400 dark:data-[state=on]:border-emerald-500/30"

const CARD_VARIANTS = [
  { key: "A", name: "Magazine" },
  { key: "B", name: "Compact Row" },
  { key: "C", name: "Overlay" },
  { key: "D", name: "Detailed" },
] as const

export function ResourceCatalogClient({
  departments,
  courses,
  initialResources,
  variant = "A",
  universityName = null,
}: {
  departments: Department[]
  courses: Course[]
  initialResources: CatalogResource[]
  variant?: string
  universityName?: string | null
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

    client.api.resources
      .$get({
        query: {
          resourceType: filters.resourceType || undefined,
          departmentId: filters.departmentId || undefined,
          courseId: filters.courseId || undefined,
        },
      })
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load resources")
        return res.json()
      })
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

  return (
    <div className="flex flex-col gap-8">
      <CatalogFiltersBar
        departments={departments}
        courses={courses}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <section
        className="flex flex-col gap-4"
        aria-label="Resources"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Updating…</p>
        ) : null}

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
          <>
            {variant === "B" ? (
              <VariantB resources={resources} />
            ) : variant === "C" ? (
              <VariantC resources={resources} />
            ) : variant === "D" ? (
              <VariantD
                resources={resources}
                departments={departments}
                universityName={universityName}
              />
            ) : (
              <VariantA resources={resources} />
            )}
          </>
        )}
      </section>

      <PrototypeSwitcher variants={[...CARD_VARIANTS]} current={variant} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Filter bar: resource-type tabs + course dropdown                  */
/* ------------------------------------------------------------------ */

function CatalogFiltersBar({
  departments,
  courses,
  filters,
  onFiltersChange,
}: {
  departments: Department[]
  courses: Course[]
  filters: CatalogFilters
  onFiltersChange: (filters: CatalogFilters) => void
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const filteredCourses = filterCoursesByDepartment(courses, filters.departmentId)
  const typeValue = filters.resourceType ? [filters.resourceType] : [ALL_TYPE_KEY]

  // Build course label for the dropdown button
  const hasCourseFilter = Boolean(filters.departmentId || filters.courseId)
  const courseButtonParts: string[] = []
  if (filters.departmentId) {
    const dept = departments.find((d) => d.id === filters.departmentId)
    if (dept) courseButtonParts.push(dept.name)
  }
  if (filters.courseId) {
    const course = courses.find((c) => c.id === filters.courseId)
    if (course) courseButtonParts.push(course.code)
  }
  const courseButtonLabel =
    courseButtonParts.length > 0
      ? courseButtonParts.join(" · ")
      : "Filter by course"

  // Close dropdown on outside click (ignore Base UI Select portals)
  React.useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (
        dropdownRef.current?.contains(target) ||
        buttonRef.current?.contains(target) ||
        target.closest("[data-slot='select-content']") ||
        target.closest("[data-slot='select-item']")
      ) {
        return
      }
      setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [dropdownOpen])

  // Close on Escape
  React.useEffect(() => {
    if (!dropdownOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [dropdownOpen])

  return (
    <div
      className="flex flex-col gap-3"
      role="search"
      aria-label="Filter resources"
    >
      {/* Resource type tabs with "All" */}
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={2}
        value={typeValue}
        onValueChange={(next) => {
          const selected = next[0]
          if (!selected || selected === ALL_TYPE_KEY) {
            onFiltersChange({ ...filters, resourceType: null })
          } else {
            const match = resourceTypeOptions.find(
              (option) => option.value === selected
            )
            onFiltersChange({
              ...filters,
              resourceType: match?.value ?? null,
            })
          }
        }}
        className="flex flex-wrap"
        aria-label="Filter by resource type"
      >
        <ToggleGroupItem
          value={ALL_TYPE_KEY}
          aria-label="All types"
          className={ACTIVE_TOGGLE_CLASSES}
        >
          All
        </ToggleGroupItem>
        {resourceTypeOptions.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className={ACTIVE_TOGGLE_CLASSES}
          >
            {resourceTypePillLabels[option.value]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Filter by course dropdown */}
      <div className="relative">
        <Button
          ref={buttonRef}
          variant="outline"
          size="sm"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={cn(
            "gap-1.5",
            hasCourseFilter &&
              "border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
          )}
        >
          {courseButtonLabel}
          {hasCourseFilter ? (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onFiltersChange({
                  ...filters,
                  departmentId: null,
                  courseId: null,
                })
              }}
              className="ml-0.5 flex size-4 items-center justify-center rounded-full hover:bg-muted-foreground/20"
              aria-label="Clear course filter"
            >
              <X className="size-3" />
            </span>
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </Button>

        {dropdownOpen ? (
          <div
            ref={dropdownRef}
            className="absolute left-0 top-full z-40 mt-1.5 w-72 rounded-lg border border-border bg-background p-3 shadow-lg"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Department
                </Label>
                <Select
                  value={filters.departmentId ?? ALL_VALUE}
                  onValueChange={(v) =>
                    onFiltersChange({
                      ...filters,
                      departmentId: v === ALL_VALUE ? null : v,
                      courseId: null,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={ALL_VALUE}>All departments</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Course</Label>
                <Select
                  value={filters.courseId ?? ALL_VALUE}
                  onValueChange={(v) =>
                    onFiltersChange({
                      ...filters,
                      courseId: v === ALL_VALUE ? null : v,
                    })
                  }
                  disabled={!filters.departmentId}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue
                      placeholder={
                        filters.departmentId
                          ? "All courses"
                          : "Pick department first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {filters.departmentId ? (
                        <SelectItem value={ALL_VALUE}>All courses</SelectItem>
                      ) : null}
                      {filteredCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
