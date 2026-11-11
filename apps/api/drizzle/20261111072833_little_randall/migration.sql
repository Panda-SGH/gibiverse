CREATE TABLE "course" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"code" text NOT NULL UNIQUE,
	"department_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"university_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "university" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_department_id_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id");--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_university_id_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "university"("id");