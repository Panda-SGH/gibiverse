import { MessageSquareQuote } from "lucide-react"
import { AskQuestionButton } from "@/components/ask-question-button"
import { listCourses, listDepartments, listUniversities } from "@/lib/academic"
import { listQuestions } from "@/lib/question-catalog"
import { QuestionCatalogClient } from "./question-catalog-client"

export default async function QuestionsPage() {
  const [universities, departments, courses, questions] = await Promise.all([
    listUniversities(),
    listDepartments(),
    listCourses(),
    listQuestions(),
  ])

  const primaryUniversity = universities[0] ?? null
  const scopedDepartments = primaryUniversity
    ? departments.filter((d) => d.universityId === primaryUniversity.id)
    : departments

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquareQuote className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Course Q&amp;A</h1>
            <p className="text-sm text-muted-foreground">
              Browse academic questions by course and ask peers for help.
            </p>
          </div>
        </div>
        <AskQuestionButton
          departments={scopedDepartments}
          courses={courses}
        />
      </div>

      <QuestionCatalogClient
        departments={scopedDepartments}
        courses={courses}
        initialQuestions={questions}
      />
    </div>
  )
}
