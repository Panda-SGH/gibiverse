import { relations } from "drizzle-orm/_relations"
import { pgTable, text } from "drizzle-orm/pg-core"

export const university = pgTable("university", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
})

export const department = pgTable("department", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  universityId: text("university_id")
    .notNull()
    .references(() => university.id),
})

export const course = pgTable("course", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id),
})

export const universityRelations = relations(university, ({ many }) => ({
  departments: many(department),
}))

export const departmentRelations = relations(department, ({ one, many }) => ({
  university: one(university, {
    fields: [department.universityId],
    references: [university.id],
  }),
  courses: many(course),
}))

export const courseRelations = relations(course, ({ one }) => ({
  department: one(department, {
    fields: [course.departmentId],
    references: [department.id],
  }),
}))
