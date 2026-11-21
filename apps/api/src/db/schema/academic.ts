import { relations } from "drizzle-orm/_relations"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const university = pgTable("university", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const department = pgTable("department", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  universityId: text("university_id")
    .notNull()
    .references(() => university.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const course = pgTable("course", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  universityId: text("university_id")
    .notNull()
    .references(() => university.id),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const universityRelations = relations(university, ({ many }) => ({
  departments: many(department),
  courses: many(course),
}))

export const departmentRelations = relations(department, ({ one, many }) => ({
  university: one(university, {
    fields: [department.universityId],
    references: [university.id],
  }),
  courses: many(course),
}))

export const courseRelations = relations(course, ({ one }) => ({
  university: one(university, {
    fields: [course.universityId],
    references: [university.id],
  }),
  department: one(department, {
    fields: [course.departmentId],
    references: [department.id],
  }),
}))
