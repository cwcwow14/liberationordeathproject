CREATE TABLE "replies" (
	"id" serial PRIMARY KEY,
	"thread_id" integer NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reply_reactions" (
	"id" serial PRIMARY KEY,
	"reply_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	CONSTRAINT "uniq_reply_reaction" UNIQUE("reply_id","user_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "thread_reactions" (
	"id" serial PRIMARY KEY,
	"thread_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	CONSTRAINT "uniq_thread_reaction" UNIQUE("thread_id","user_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"pinned" boolean DEFAULT false,
	"hot" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_thread_id_threads_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reply_reactions" ADD CONSTRAINT "reply_reactions_reply_id_replies_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "replies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "thread_reactions" ADD CONSTRAINT "thread_reactions_thread_id_threads_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE;