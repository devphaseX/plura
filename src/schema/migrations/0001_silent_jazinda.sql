ALTER TABLE "notification" ALTER COLUMN "subaccount_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "user_id" text NOT NULL;