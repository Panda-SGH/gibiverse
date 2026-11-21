ALTER TABLE "course" ADD COLUMN "university_id" text;--> statement-breakpoint
UPDATE "course" SET "university_id" = "department"."university_id" FROM "department" WHERE "course"."department_id" = "department"."id";--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "university_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course_material" ADD COLUMN "academic_period" text;--> statement-breakpoint
UPDATE "course_material" SET "academic_period" = CASE
  WHEN "semester" = 'summer' THEN ("year"::text || '/' || ("year" + 1)::text || ' summer')
  ELSE ("year"::text || '/' || ("year" + 1)::text || ' semester ' || "semester")
END;--> statement-breakpoint
ALTER TABLE "course_material" ALTER COLUMN "academic_period" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course_material" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "course_material" DROP COLUMN "year";--> statement-breakpoint
ALTER TABLE "course_material" DROP COLUMN "semester";--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_university_id_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "university"("id");
