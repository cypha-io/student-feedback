CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"staff_id" uuid,
	"role" text DEFAULT 'manager' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "appraisal_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appraisee_id" uuid NOT NULL,
	"appraiser_id" uuid,
	"appraiser_type" text NOT NULL,
	"reviewer_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"session_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departments" DROP CONSTRAINT "departments_code_unique";--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "year" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "feedbacks" ALTER COLUMN "student_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD COLUMN "appraisal_assignment_id" uuid;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD COLUMN "review_status" text DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "feedbacks" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD COLUMN "is_consolidated" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "target_role" text DEFAULT 'Teaching';--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "house" text NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "staff_type" text DEFAULT 'Teaching' NOT NULL;--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "role" text DEFAULT 'Teacher' NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" DROP COLUMN "grade";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "code";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "description";