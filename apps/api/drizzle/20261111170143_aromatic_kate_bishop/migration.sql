CREATE TABLE "question" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_score" integer DEFAULT 0 NOT NULL,
	"answer_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id");--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");