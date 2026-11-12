CREATE TABLE "answer" (
	"id" text PRIMARY KEY,
	"body" text NOT NULL,
	"question_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "department" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "university" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "accepted_answer_id" text;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_accepted_answer_id_answer_id_fkey" FOREIGN KEY ("accepted_answer_id") REFERENCES "answer"("id") ON DELETE SET NULL;