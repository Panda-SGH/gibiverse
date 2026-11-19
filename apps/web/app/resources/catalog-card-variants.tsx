"use client"

/**
 * PROTOTYPE — Catalog card variants with thumbnails.
 *
 * Three radically different card layouts, switchable via ?variant=A|B|C
 * on the existing /resources route.
 *
 * Variant A: "Magazine" — vertical card, large 3:2 thumbnail on top, trimmed metadata
 * Variant B: "Compact Row" — horizontal, small square thumbnail left, full metadata right
 * Variant C: "Overlay" — full-bleed thumbnail, text overlaid on dark gradient
 */

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  Presentation,
  File,
  BookOpen,
} from "lucide-react"
import { Badge } from "@gibiverse/ui/components/badge"
import { cn } from "@gibiverse/ui/lib/utils"
import { formatAcademicPeriod, formatRelativeUploadDate } from "@/lib/formatters"
import {
  resourceTypePillLabels,
  type ResourceType,
} from "@gibiverse/shared/types"
import type { CatalogResource } from "./presentation"
import { simulateThumbnail, type SimulatedThumbnail } from "./prototype-thumbnail-sim"

/* ------------------------------------------------------------------ */
/*  Shared: file-type icon for fallbacks                              */
/* ------------------------------------------------------------------ */

function FileTypeIcon({
  resourceType,
  className,
}: {
  resourceType: string
  className?: string
}) {
  const cls = cn("size-8 text-muted-foreground/60", className)
  switch (resourceType) {
    case "exam":
    case "notes":
    case "assignment":
      return <FileText className={cls} />
    case "slides":
      return <Presentation className={cls} />
    case "lab":
      return <BookOpen className={cls} />
    default:
      return <File className={cls} />
  }
}

/* ------------------------------------------------------------------ */
/*  Shared: simulated thumbnail block                                 */
/* ------------------------------------------------------------------ */

function ThumbnailBlock({
  sim,
  resourceType,
  className,
  iconClassName,
}: {
  sim: SimulatedThumbnail
  resourceType: string
  className?: string
  iconClassName?: string
}) {
  if (sim.hasThumbnail) {
    return (
      <div
        className={cn(
          "bg-gradient-to-br",
          sim.gradient,
          `dark:${sim.darkGradient}`,
          className
        )}
      >
        {/* Simulated "document preview" lines */}
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3 opacity-40">
          <div className="h-1.5 w-3/4 rounded-full bg-white/70" />
          <div className="h-1.5 w-1/2 rounded-full bg-white/70" />
          <div className="h-1.5 w-2/3 rounded-full bg-white/70" />
          <div className="mt-1 h-1.5 w-3/5 rounded-full bg-white/70" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/50",
        className
      )}
    >
      <FileTypeIcon resourceType={resourceType} className={iconClassName} />
    </div>
  )
}

/* ================================================================== */
/*  VARIANT A — Magazine (vertical, large thumbnail on top)           */
/* ================================================================== */

export function VariantA({ resources }: { resources: CatalogResource[] }) {
  return (
    <ul
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="resources-grid"
    >
      {resources.map((r) => {
        const sim = simulateThumbnail(r)
        return (
          <li key={r.id}>
            <Link
              href={`/resources/${r.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              data-testid={`resource-card-${r.id}`}
            >
              {/* Thumbnail — 3:2 aspect ratio */}
              <ThumbnailBlock
                sim={sim}
                resourceType={r.resourceType}
                className="aspect-[3/2] w-full shrink-0 transition-transform group-hover:scale-[1.02]"
              />

              {/* Content: trimmed — title + badges only */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                  {r.title}
                </h3>
                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {r.courseCode}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {resourceTypePillLabels[r.resourceType as ResourceType] ??
                      r.resourceType}
                  </Badge>
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

VariantA.displayName = "Magazine"

/* ================================================================== */
/*  VARIANT B — Compact Row (horizontal, thumbnail on left)           */
/* ================================================================== */

export function VariantB({ resources }: { resources: CatalogResource[] }) {
  return (
    <ul className="flex flex-col gap-3" data-testid="resources-grid">
      {resources.map((r) => {
        const sim = simulateThumbnail(r)
        return (
          <li key={r.id}>
            <Link
              href={`/resources/${r.id}`}
              className="flex items-stretch gap-4 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              data-testid={`resource-card-${r.id}`}
            >
              {/* Square thumbnail */}
              <ThumbnailBlock
                sim={sim}
                resourceType={r.resourceType}
                className="size-20 shrink-0 rounded-md"
                iconClassName="size-6"
              />

              {/* Full metadata */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {r.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {r.courseCode}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {resourceTypePillLabels[r.resourceType as ResourceType] ??
                      r.resourceType}
                  </Badge>
                </div>
                <p className="mt-auto text-xs text-muted-foreground">
                  {formatAcademicPeriod(r.year, r.semester)}
                  <span aria-hidden="true"> · </span>
                  <time dateTime={r.createdAt}>
                    {formatRelativeUploadDate(r.createdAt)}
                  </time>
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

VariantB.displayName = "Compact Row"

/* ================================================================== */
/*  VARIANT C — Overlay (full-bleed thumbnail, text on gradient)      */
/* ================================================================== */

export function VariantC({ resources }: { resources: CatalogResource[] }) {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="resources-grid"
    >
      {resources.map((r) => {
        const sim = simulateThumbnail(r)
        return (
          <li key={r.id}>
            <Link
              href={`/resources/${r.id}`}
              className="group relative flex aspect-[4/3] w-full overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              data-testid={`resource-card-${r.id}`}
            >
              {/* Full-bleed thumbnail */}
              {sim.hasThumbnail ? (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-transform group-hover:scale-105",
                    sim.gradient,
                    `dark:${sim.darkGradient}`
                  )}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-6 opacity-30">
                    <div className="h-2 w-3/4 rounded-full bg-white/80" />
                    <div className="h-2 w-1/2 rounded-full bg-white/80" />
                    <div className="h-2 w-2/3 rounded-full bg-white/80" />
                    <div className="mt-2 h-2 w-3/5 rounded-full bg-white/80" />
                    <div className="h-2 w-1/2 rounded-full bg-white/80" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <FileTypeIcon
                    resourceType={r.resourceType}
                    className="size-12 text-muted-foreground/40"
                  />
                </div>
              )}

              {/* Dark gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                    {r.courseCode}
                  </span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                    {resourceTypePillLabels[r.resourceType as ResourceType] ??
                      r.resourceType}
                  </span>
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-white">
                  {r.title}
                </h3>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

VariantC.displayName = "Overlay"
