import { notFound } from "next/navigation"
import { getQuestion } from "@/lib/question-detail"
import { QuestionDiscussion } from "@/components/question-discussion"

type QuestionPageProps = {
  params: Promise<{ id: string }>
}

export default async function QuestionDetailPage({ params }: QuestionPageProps) {
  const { id } = await params
  const question = await getQuestion(id)

  if (!question) {
    notFound()
  }

  return <QuestionDiscussion initialQuestion={question} />
}
