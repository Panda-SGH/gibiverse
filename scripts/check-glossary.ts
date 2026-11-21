#!/usr/bin/env node
/**
 * Enforces GLOSSARY.md _Avoid_ terms.
 * Scans UI files, route handlers, and presentation modules for banned terms.
 * Run via: pnpm check-glossary (or: npx tsx scripts/check-glossary.ts)
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

// High-confidence banned domain terms from GLOSSARY.md _Avoid_ directives:
// Term pattern and the canonical replacement
const domainRules = [
  { pattern: /\bsolutions\b/i, avoid: "solutions", preferred: "answers" },
  { pattern: /\bsolution\b/i, avoid: "solution", preferred: "answer" },
  { pattern: /\bdiscussion threads?\b/i, avoid: "discussion thread(s)", preferred: "Q&A" },
  { pattern: /\bbest answers?\b/i, avoid: "best answer(s)", preferred: "accepted answer" },
  { pattern: /\bcorrect answers?\b/i, avoid: "correct answer(s)", preferred: "accepted answer" },
]

// Target directories for domain terminology checks
const scanDirs = [
  path.join(rootDir, "apps/web/app"),
  path.join(rootDir, "apps/web/components"),
  path.join(rootDir, "apps/api/src/routes"),
]

// Allowed exceptions (e.g. third-party library names, raw markdown components, comments)
const ignoredFiles = [
  "markdown-renderer.tsx",
]

function collectFiles(dir: string, fileList: string[] = []): string[] {
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = path.join(dir, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        collectFiles(fullPath, fileList)
      } else if (/\.(ts|tsx)$/.test(entry) && !ignoredFiles.includes(entry)) {
        fileList.push(fullPath)
      }
    }
  } catch {
    // Directory might not exist or be empty
  }
  return fileList
}

let violationsCount = 0

for (const dir of scanDirs) {
  const files = collectFiles(dir)
  for (const file of files) {
    const relativePath = path.relative(rootDir, file)
    const content = readFileSync(file, "utf8")
    const lines = content.split("\n")

    lines.forEach((line, index) => {
      // Skip pure import statements or comments
      const trimmed = line.trim()
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
        return
      }
      if (trimmed.startsWith("import ") || trimmed.startsWith("export type ")) {
        return
      }

      for (const rule of domainRules) {
        if (rule.pattern.test(line)) {
          // Check if it's not a common technical substring (e.g. material-ui, solution in math lib, etc.)
          console.error(
            `\n❌ Glossary violation in ${relativePath}:${index + 1}:`
          )
          console.error(`   Found avoided term "${rule.avoid}" -> prefer "${rule.preferred}"`)
          console.error(`   ${line.trim()}`)
          violationsCount++
        }
      }
    })
  }
}

if (violationsCount > 0) {
  console.error(`\nFound ${violationsCount} glossary violation(s). See GLOSSARY.md for canonical terms.\n`)
  process.exit(1)
} else {
  console.log("✅ No glossary violations found in domain modules.")
  process.exit(0)
}
