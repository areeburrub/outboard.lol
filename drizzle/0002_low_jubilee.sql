ALTER TABLE "boards" ADD COLUMN "min_bid_cents" integer DEFAULT 500 NOT NULL;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "rules" text;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "links" jsonb DEFAULT '[]'::jsonb NOT NULL;