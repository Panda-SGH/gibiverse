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
} from "@/lib/academic"

export type CoursePickerProps = {
  departments: Department[]
  courses: Course[]
  departmentId?: string | null
  courseId?: string | null
  onDepartmentChange?: (departmentId: string | null) => void
  onCourseChange?: (courseId: string | null) => void
  disabled?: boolean
}

export function CoursePicker({
  departments,
  courses,
  departmentId: controlledDepartmentId,
  courseId: controlledCourseId,
  onDepartmentChange,
  onCourseChange,
  disabled = false,
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
    const next = value || null
    setDepartmentId(next)
    setCourseId(null)
    onDepartmentChange?.(next)
    onCourseChange?.(null)
  }

  const handleCourseChange = (value: string | null) => {
    const next = value || null
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
          value={departmentId}
          onValueChange={handleDepartmentChange}
          disabled={disabled}
        >
          <SelectTrigger
            id="department-picker"
            className="w-full"
            data-testid="department-picker-trigger"
          >
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
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
          value={courseId}
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
                departmentId ? "Select a course" : "Choose a department first"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
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
