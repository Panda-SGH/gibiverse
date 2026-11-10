import Link from "next/link"
import { BookOpen, MessageSquareQuote, Search, Sparkles } from "lucide-react"
import { Button } from "@gibiverse/ui/components/button"

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          <span>University Academic Hub</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Academic Resource Sharing &amp; Course Q&amp;A
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground">
          Gibiverse connects students to course resources, past exams, lecture
          notes, and peer-driven academic Q&amp;A across departments.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/resources">
            <Button size="lg" className="gap-2">
              <BookOpen className="size-4" />
              <span>Browse Resources</span>
            </Button>
          </Link>
          <Link href="/qa">
            <Button variant="outline" size="lg" className="gap-2">
              <MessageSquareQuote className="size-4" />
              <span>Ask Questions</span>
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="ghost" size="lg" className="gap-2">
              <Search className="size-4" />
              <span>Search Catalog</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
