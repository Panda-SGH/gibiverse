"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gibiverse/ui/components/select"
import { Label } from "@gibiverse/ui/components/label"
import {
  filterCoursesByDepartment,
  type Course,
  type Department,
} from "@/app/courses/presentation"

const ALL_VALUE = "__all__"

export type CoursePickerProps = {
  departments: Department[]
  courses: Course[]
  departmentId?: string | null
  courseId?: string | null
  onDepartmentChange?: (departmentId: string | null) => void
  onCourseChange?: (courseId: string | null) => void
  disabled?: boolean
  /** When true, include All options so filters can be cleared. */
  allowClear?: boolean
}

export function CoursePicker({
  departments,
  courses,
  departmentId: controlledDepartmentId,
  courseId: controlledCourseId,
  onDepartmentChange,
  onCourseChange,
  disabled = false,
  allowClear = false,
}: CoursePickerProps) {
  const [departmentId, setDepartmentId] = React.useState<string | null>(
    controlledDepartmentId ?? null
  )
  const [courseId, setCourseId] = React.useState<string | null>(
    controlledCourseId ?? null
  )

  React.useEffect(() => {
    if (controlledDepartmentId !== undefined) {
      setDepartmentId(controlledDepartmentId)
    }
  }, [controlledDepartmentId])

  React.useEffect(() => {
    if (controlledCourseId !== undefined) {
      setCourseId(controlledCourseId)
    }
  }, [controlledCourseId])

  const filteredCourses = filterCoursesByDepartment(courses, departmentId)

  const handleDepartmentChange = (value: string | null) => {
    const next = !value || value === ALL_VALUE ? null : value
    setDepartmentId(next)
    setCourseId(null)
    onDepartmentChange?.(next)
    onCourseChange?.(null)
  }

  const handleCourseChange = (value: string | null) => {
    const next = !value || value === ALL_VALUE ? null : value
    setCourseId(next)
    onCourseChange?.(next)
  }

  return (
    <div
      className="flex flex-col gap-4 sm:flex-row"
      data-testid="course-picker"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Label htmlFor="department-picker">Department</Label>
        <Select
          value={allowClear ? (departmentId ?? ALL_VALUE) : departmentId}
          onValueChange={handleDepartmentChange}
          disabled={disabled}
        >
          <SelectTrigger
            id="department-picker"
            className="w-full"
            data-testid="department-picker-trigger"
          >
            <SelectValue
              placeholder={
                allowClear ? "All departments" : "Select a department"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {allowClear ? (
                <SelectItem value={ALL_VALUE}>All departments</SelectItem>
              ) : null}
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Label htmlFor="course-picker">Course</Label>
        <Select
          value={allowClear ? (courseId ?? ALL_VALUE) : courseId}
          onValueChange={handleCourseChange}
          disabled={disabled || !departmentId}
        >
          <SelectTrigger
            id="course-picker"
            className="w-full"
            data-testid="course-picker-trigger"
          >
            <SelectValue
              placeholder={
                departmentId
                  ? allowClear
                    ? "All courses"
                    : "Select a course"
                  : "Choose a department first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {allowClear && departmentId ? (
                <SelectItem value={ALL_VALUE}>All courses</SelectItem>
              ) : null}
              {filteredCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} — {course.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
