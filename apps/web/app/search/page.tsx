import { Search } from "lucide-react"
import { searchPlatform, type SearchTab } from "@/lib/search"
import { SearchClient } from "./search-client"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q?.trim() || ""
  const rawType = params.type?.trim()
  const type: SearchTab =
    rawType === "resources" || rawType === "questions" ? rawType : "all"

  const data = await searchPlatform({
    query,
    type,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Search className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Platform Search
          </h1>
          <p className="text-sm text-muted-foreground">
            Search resources and questions across courses.
          </p>
        </div>
      </div>

      <SearchClient
        initialQuery={query}
        initialType={type}
        initialData={data}
      />
    </div>
  )
}
