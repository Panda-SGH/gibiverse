import { relations } from "drizzle-orm/_relations"
import {
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { course } from "./academic.js"
import { user } from "./auth.js"

export const resource = pgTable("resource", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  resourceType: text("resource_type").notNull(),
  year: integer("year").notNull(),
  semester: text("semester").notNull(),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const resourceRelations = relations(resource, ({ one }) => ({
  course: one(course, {
    fields: [resource.courseId],
    references: [course.id],
  }),
  author: one(user, {
    fields: [resource.userId],
    references: [user.id],
  }),
}))
