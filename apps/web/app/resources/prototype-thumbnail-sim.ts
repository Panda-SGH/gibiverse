import type { CatalogResource } from "./presentation"

/**
 * Simulated thumbnail data for the prototype.
 *
 * Uses a simple hash of the resource ID to deterministically decide:
 * - whether a resource "has" a thumbnail (≈70%)
 * - what gradient colours to use
 */

const GRADIENTS = [
  "from-blue-200 to-blue-400",
  "from-emerald-200 to-emerald-400",
  "from-amber-200 to-amber-400",
  "from-rose-200 to-rose-400",
  "from-violet-200 to-violet-400",
  "from-cyan-200 to-cyan-400",
  "from-orange-200 to-orange-400",
  "from-pink-200 to-pink-400",
  "from-teal-200 to-teal-400",
  "from-indigo-200 to-indigo-400",
]

const DARK_GRADIENTS = [
  "from-blue-800 to-blue-600",
  "from-emerald-800 to-emerald-600",
  "from-amber-800 to-amber-600",
  "from-rose-800 to-rose-600",
  "from-violet-800 to-violet-600",
  "from-cyan-800 to-cyan-600",
  "from-orange-800 to-orange-600",
  "from-pink-800 to-pink-600",
  "from-teal-800 to-teal-600",
  "from-indigo-800 to-indigo-600",
]

function hashCode(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export type SimulatedThumbnail = {
  hasThumbnail: boolean
  gradient: string
  darkGradient: string
}

export function simulateThumbnail(resource: CatalogResource): SimulatedThumbnail {
  const hash = hashCode(resource.id)
  const hasThumbnail = hash % 10 < 7 // 70% have thumbnails
  const index = hash % GRADIENTS.length

  return {
    hasThumbnail,
    gradient: GRADIENTS[index]!,
    darkGradient: DARK_GRADIENTS[index]!,
  }
}
