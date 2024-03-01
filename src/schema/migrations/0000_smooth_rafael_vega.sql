DO $$ BEGIN
 CREATE TYPE "action_type" AS ENUM('create-contact');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "icon" AS ENUM('settings', 'chart', 'calendar', 'check', 'chip', 'compass', 'database', 'flag', 'home', 'info', 'link', 'lock', 'messages', 'notification', 'payment', 'power', 'receipt', 'shield', 'star', 'tune', 'videorecorder', 'wallet', 'warning', 'headphone', 'send', 'pipelines', 'person', 'category', 'contact', 'clipboardIcon');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "icon_type" AS ENUM('info');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "invitation_status" AS ENUM('accepted', 'revoked', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "plan" AS ENUM('price_1OYxkqFj9oKEERu1NbKUxXxN', 'price_1OYxkqFj9oKEERu1KfJGWxgN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('agency-owner', 'agency-admin', 'subaccount-user', 'subaccount-guest');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "trigger_type" AS ENUM('contact-form');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(257) NOT NULL,
	"type" "action_type" NOT NULL,
	"order" integer NOT NULL,
	"laneId" text DEFAULT '0' NOT NULL,
	"automation_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "add_ons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"price_id" text NOT NULL,
	"agency_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_sidebar_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"content" text DEFAULT '#',
	"icon" "icon_type" DEFAULT 'info' NOT NULL,
	"agency_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connected_account_id" text,
	"customer_id" text NOT NULL,
	"name" varchar(256) NOT NULL,
	"agency_logo" varchar(256) NOT NULL,
	"company_email" varchar(256) NOT NULL,
	"company_phone" varchar(256),
	"white_label" boolean DEFAULT true NOT NULL,
	"address" varchar(256) NOT NULL,
	"city" varchar(256) NOT NULL,
	"zip_code" varchar(256) NOT NULL,
	"state" varchar(256) NOT NULL,
	"country" varchar(256) NOT NULL,
	"goal" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation_instance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"automation_id" uuid NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "automation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"trigger_id" uuid,
	"subaccount_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "className" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"color" varchar(256) NOT NULL,
	"custom_data" text,
	"funnel_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"subaccount_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "funnel_page" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"pathname" text NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"content" text,
	"order" integer NOT NULL,
	"preview_image" text,
	"funnel_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "funnel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"favicon" text,
	"subdomain_name" varchar(256),
	"description" text,
	"published" boolean DEFAULT false NOT NULL,
	"live_products" json DEFAULT '[]'::json,
	"subaccount_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subaccount_sidebar_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"content" text DEFAULT '#',
	"icon" "icon_type" DEFAULT 'info' NOT NULL,
	"subaccount_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lane" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"type" varchar(256),
	"line" varchar(256) NOT NULL,
	"subaccount_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "media_line_unique" UNIQUE("line")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"agency_id" uuid NOT NULL,
	"subaccount_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"sub_account_id" uuid NOT NULL,
	"access" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pipeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"subaccount_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subaccount" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connect_account_id" text,
	"name" varchar(256),
	"subaccount_logo" text NOT NULL,
	"company_email" text NOT NULL,
	"company_phone" varchar(64),
	"goal" integer DEFAULT 5 NOT NULL,
	"address" varchar(256) NOT NULL,
	"city" varchar(256) NOT NULL,
	"zip_code" varchar(256) NOT NULL,
	"state" varchar(256) NOT NULL,
	"country" varchar(256) NOT NULL,
	"agency_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan" "plan",
	"price" text,
	"active" boolean DEFAULT false NOT NULL,
	"price_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"current_period_end_date" timestamp NOT NULL,
	"subscription_id" text NOT NULL,
	"agency_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"color" varchar(256) NOT NULL,
	"subaccount_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket" (
	"id" uuid,
	"name" varchar(256) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"value" numeric,
	"description" text,
	"assigned_user_id" uuid,
	"lane_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trigger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"type" "trigger_type" NOT NULL,
	"subaccount_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"avatar_url" varchar(256),
	"email" varchar(256) NOT NULL,
	"role" "role" DEFAULT 'subaccount-user' NOT NULL,
	"agency_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "permission" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "action" ADD CONSTRAINT "action_automation_id_automation_id_fk" FOREIGN KEY ("automation_id") REFERENCES "automation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "add_ons" ADD CONSTRAINT "add_ons_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_sidebar_option" ADD CONSTRAINT "agency_sidebar_option_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation_instance" ADD CONSTRAINT "automation_instance_automation_id_automation_id_fk" FOREIGN KEY ("automation_id") REFERENCES "automation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation" ADD CONSTRAINT "automation_trigger_id_trigger_id_fk" FOREIGN KEY ("trigger_id") REFERENCES "trigger"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "automation" ADD CONSTRAINT "automation_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "className" ADD CONSTRAINT "className_funnel_id_funnel_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "funnel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contact" ADD CONSTRAINT "contact_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "funnel_page" ADD CONSTRAINT "funnel_page_funnel_id_funnel_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "funnel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "funnel" ADD CONSTRAINT "funnel_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subaccount_sidebar_option" ADD CONSTRAINT "subaccount_sidebar_option_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lane" ADD CONSTRAINT "lane_pipeline_id_pipeline_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "pipeline"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "permission" ADD CONSTRAINT "permission_sub_account_id_subaccount_id_fk" FOREIGN KEY ("sub_account_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pipeline" ADD CONSTRAINT "pipeline_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subaccount" ADD CONSTRAINT "subaccount_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag" ADD CONSTRAINT "tag_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "ticket_id_contact_id_fk" FOREIGN KEY ("id") REFERENCES "contact"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "ticket_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "ticket_lane_id_lane_id_fk" FOREIGN KEY ("lane_id") REFERENCES "lane"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trigger" ADD CONSTRAINT "trigger_subaccount_id_subaccount_id_fk" FOREIGN KEY ("subaccount_id") REFERENCES "subaccount"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_agency_id_agency_id_fk" FOREIGN KEY ("agency_id") REFERENCES "agency"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
