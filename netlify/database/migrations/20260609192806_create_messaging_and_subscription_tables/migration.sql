CREATE TABLE "direct_messages" (
	"id" serial PRIMARY KEY,
	"member_id" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"from_creator" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "group_messages" (
	"id" serial PRIMARY KEY,
	"room" text NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"user_name" text NOT NULL,
	"tier" text DEFAULT 'inner_circle' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_ideas" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"idea" text NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vip_videos" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"poster" text,
	"duration" text,
	"created_at" timestamp DEFAULT now()
);
