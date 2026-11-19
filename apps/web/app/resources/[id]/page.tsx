import { notFound } from "next/navigation"
import { client } from "@gibiverse/api-client"
import { resolvePreviewType } from "../presentation"
import { resourceTypeOptions } from "@gibiverse/shared/types"
import {
  VariantA,
  VariantB,
  VariantC,
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
  const { variant = "A" } = (await searchParams) ?? {}

  const res = await client.api.resources[":id"]
    .$get({
      param: { id },
    })
    .catch(() => null)

  if (!res || !res.ok) notFound()
  const resource = await res.json()

  const previewType = resolvePreviewType(resource.fileName, resource.mimeType)
  const typeLabel =
    resourceTypeOptions.find((option) => option.value === resource.resourceType)
      ?.label ?? resource.resourceType

  const detailData: DetailResourceData = {
    ...resource,
    typeLabel,
    previewType,
  }

  const activeVariant = ["A", "B", "C"].includes(variant.toUpperCase())
    ? variant.toUpperCase()
    : "A"

  const variantsList = [
    { key: "A", name: "Split Reader" },
    { key: "B", name: "Academic Brief" },
    { key: "C", name: "Workspace Ribbon" },
  ]

  return (
    <>
      {activeVariant === "A" && <VariantA resource={detailData} />}
      {activeVariant === "B" && <VariantB resource={detailData} />}
      {activeVariant === "C" && <VariantC resource={detailData} />}
      <PrototypeSwitcher variants={variantsList} current={activeVariant} />
    </>
  )
}
