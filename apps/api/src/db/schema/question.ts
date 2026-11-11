import { relations } from "drizzle-orm/_relations"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { course } from "./academic.js"
import { user } from "./auth.js"

export const question = pgTable("question", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  voteScore: integer("vote_score").default(0).notNull(),
  answerCount: integer("answer_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const questionRelations = relations(question, ({ one }) => ({
  course: one(course, {
    fields: [question.courseId],
    references: [course.id],
  }),
  author: one(user, {
    fields: [question.userId],
    references: [user.id],
  }),
}))
