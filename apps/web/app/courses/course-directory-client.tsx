"use client"

import * as React from "react"
import { CoursePicker } from "@/components/course-picker"
import {
  groupCoursesByDepartment,
  type Course,
  type Department,
} from "./presentation"

export function CourseDirectoryClient({
  departments,
  courses,
}: {
  departments: Department[]
  courses: Course[]
}) {
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(
    null
  )

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null
  const grouped = groupCoursesByDepartment(departments, courses)

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3" aria-labelledby="picker-heading">
        <div>
          <h2
            id="picker-heading"
            className="text-lg font-semibold text-foreground"
          >
            Find a course
          </h2>
          <p className="text-sm text-muted-foreground">
            Filter by department, then select a course. This picker is reused
            when uploading resources or posting questions.
          </p>
        </div>
        <CoursePicker
          departments={departments}
          courses={courses}
          courseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
        />
        {selectedCourse ? (
          <p
            className="text-sm text-foreground"
            data-testid="selected-course-summary"
          >
            Selected:{" "}
            <span className="font-medium">
              {selectedCourse.code} — {selectedCourse.name}
            </span>
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="catalog-heading">
        <h2
          id="catalog-heading"
          className="text-lg font-semibold text-foreground"
        >
          Departments &amp; courses
        </h2>

        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No departments have been seeded yet. Run the API seed script to
            populate the catalog.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {grouped.map((department) => (
              <div
                key={department.id}
                className="flex flex-col gap-3"
                data-testid={`department-section-${department.id}`}
              >
                <h3 className="text-base font-semibold text-foreground">
                  {department.name}
                </h3>
                {department.courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No courses offered yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {department.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                        data-testid={`course-row-${course.code}`}
                      >
                        <span className="font-mono text-sm font-semibold text-primary">
                          {course.code}
                        </span>
                        <span className="text-sm text-foreground">
                          {course.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
