ALTER TABLE "listings" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "favicon_url" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "meta_fetched_at" timestamp with time zone;