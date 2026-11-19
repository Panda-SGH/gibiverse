import { notFound } from "next/navigation"
import { client } from "@gibiverse/api-client"
import { resolvePreviewType } from "../presentation"
import { resourceTypeOptions } from "@gibiverse/shared/types"
import {
  VariantA,
  VariantB,
  VariantC,
  VariantD,
  type DetailResourceData,
} from "./detail-layout-variants"
import { PrototypeSwitcher } from "@/components/prototype-switcher"

type ResourcePageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ variant?: string }>
}

export default async function ResourceDetailPage({
  params,
  searchParams,
}: ResourcePageProps) {
  const { id } = await params
  const { variant = "D" } = (await searchParams) ?? {}

  const [res, coursesRes, deptRes, univRes] = await Promise.all([
    client.api.resources[":id"]
      .$get({
        param: { id },
      })
      .catch(() => null),
    client.api.courses.$get().catch(() => null),
    client.api.departments.$get().catch(() => null),
    client.api.universities.$get().catch(() => null),
  ])

  if (!res || !res.ok) notFound()
  const resource = await res.json()

  const courses = coursesRes && coursesRes.ok ? await coursesRes.json() : []
  const departments = deptRes && deptRes.ok ? await deptRes.json() : []
  const universities = univRes && univRes.ok ? await univRes.json() : []

  const matchedCourse = courses.find((c) => c.id === resource.courseId)
  const matchedDept = departments.find(
    (d) => d.id === matchedCourse?.departmentId
  )
  const matchedUni = universities.find(
    (u) => u.id === matchedDept?.universityId
  )

  const universityName =
    matchedUni?.name ?? universities[0]?.name ?? "Gibiverse University"
  const departmentName = matchedDept?.name ?? "Computer Science"

  const previewType = resolvePreviewType(resource.fileName, resource.mimeType)
  const typeLabel =
    resourceTypeOptions.find((option) => option.value === resource.resourceType)
      ?.label ?? resource.resourceType

  const detailData: DetailResourceData = {
    ...resource,
    departmentName,
    universityName,
    typeLabel,
    previewType,
  }

  const activeVariant = ["A", "B", "C", "D"].includes(variant.toUpperCase())
    ? variant.toUpperCase()
    : "D"

  const variantsList = [
    { key: "D", name: "Uncarded (Left Download)" },
    { key: "A", name: "Split Reader" },
    { key: "B", name: "Academic Brief" },
    { key: "C", name: "Workspace Ribbon" },
  ]

  return (
    <>
      {activeVariant === "D" && <VariantD resource={detailData} />}
      {activeVariant === "A" && <VariantA resource={detailData} />}
      {activeVariant === "B" && <VariantB resource={detailData} />}
      {activeVariant === "C" && <VariantC resource={detailData} />}
      <PrototypeSwitcher variants={variantsList} current={activeVariant} />
    </>
  )
}
