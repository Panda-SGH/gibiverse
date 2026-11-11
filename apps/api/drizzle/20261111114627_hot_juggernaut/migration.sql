CREATE TABLE "resource" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"resource_type" text NOT NULL,
	"year" integer NOT NULL,
	"semester" text NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id");--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");