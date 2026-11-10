import { MessageSquareQuote } from "lucide-react"

export default function QAPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareQuote className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Course Q&amp;A</h1>
          <p className="text-sm text-muted-foreground">
            Ask academic questions and post answers with university peers.
          </p>
        </div>
      </div>
    </div>
  )
}
