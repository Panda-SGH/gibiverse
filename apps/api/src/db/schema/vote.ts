import { relations } from "drizzle-orm/_relations"
import { integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core"
import { user } from "./auth.js"

export const vote = pgTable(
  "vote",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    value: integer("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("vote_user_target_unique").on(
      table.userId,
      table.targetType,
      table.targetId
    ),
  ]
)

export const voteRelations = relations(vote, ({ one }) => ({
  student: one(user, {
    fields: [vote.userId],
    references: [user.id],
  }),
}))
