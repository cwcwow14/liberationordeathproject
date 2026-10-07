CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY,
	"kind" text NOT NULL,
	"path" text NOT NULL,
	"detail" text,
	"referrer" text,
	"mobile" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "map_pins" (
	"id" serial PRIMARY KEY,
	"place_key" text NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" ("created_at");--> statement-breakpoint
CREATE INDEX "map_pins_ip_hash_idx" ON "map_pins" ("ip_hash");