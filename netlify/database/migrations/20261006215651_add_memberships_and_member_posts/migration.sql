CREATE TABLE "member_posts" (
	"id" serial PRIMARY KEY,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"video_url" text,
	"min_tier" text NOT NULL,
	"early_until" timestamp,
	"author_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"email" text,
	"name" text,
	"tier" text NOT NULL,
	"status" text NOT NULL,
	"ls_subscription_id" text NOT NULL,
	"ls_customer_id" text,
	"variant_id" text,
	"renews_at" timestamp,
	"ends_at" timestamp,
	"ls_updated_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
