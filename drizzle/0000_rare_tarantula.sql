CREATE TYPE "public"."bid_status" AS ENUM('succeeded');--> statement-breakpoint
CREATE TYPE "public"."board_status" AS ENUM('setup', 'live', 'paused');--> statement-breakpoint
CREATE TYPE "public"."dodo_setup_mode" AS ENUM('auto', 'manual');--> statement-breakpoint
CREATE TYPE "public"."listing_kind" AS ENUM('url', 'handle');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('live', 'removed');--> statement-breakpoint
CREATE TYPE "public"."platform_fee_status" AS ENUM('none', 'due', 'paid');--> statement-breakpoint
CREATE TABLE "bids" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"new_total_cents" integer NOT NULL,
	"dodo_payment_id" text NOT NULL,
	"bidder_email" text,
	"status" "bid_status" DEFAULT 'succeeded' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"status" "board_status" DEFAULT 'setup' NOT NULL,
	"total_bids_cents" integer DEFAULT 0 NOT NULL,
	"platform_fee_status" "platform_fee_status" DEFAULT 'none' NOT NULL,
	"dodo_setup_mode" "dodo_setup_mode",
	"dodo_api_key_encrypted" text,
	"dodo_webhook_secret_encrypted" text,
	"dodo_product_id" text,
	"dodo_webhook_id" text,
	"dodo_key_last4" text,
	"dodo_connected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"canonical_key" text NOT NULL,
	"display_url" text NOT NULL,
	"kind" "listing_kind" NOT NULL,
	"total_bid_cents" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"status" "listing_status" DEFAULT 'live' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_fee_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"amount_cents" integer DEFAULT 1000 NOT NULL,
	"dodo_payment_id" text NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"username" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_fee_payments" ADD CONSTRAINT "platform_fee_payments_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bids_dodo_payment_id_uidx" ON "bids" USING btree ("dodo_payment_id");--> statement-breakpoint
CREATE INDEX "bids_board_created_idx" ON "bids" USING btree ("board_id","created_at");--> statement-breakpoint
CREATE INDEX "bids_listing_id_idx" ON "bids" USING btree ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "boards_slug_uidx" ON "boards" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "boards_owner_id_uidx" ON "boards" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "boards_owner_id_idx" ON "boards" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "clicks_board_created_idx" ON "clicks" USING btree ("board_id","created_at");--> statement-breakpoint
CREATE INDEX "clicks_listing_id_idx" ON "clicks" USING btree ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_board_canonical_uidx" ON "listings" USING btree ("board_id","canonical_key");--> statement-breakpoint
CREATE INDEX "listings_board_rank_idx" ON "listings" USING btree ("board_id","status","total_bid_cents","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_fee_payments_dodo_payment_id_uidx" ON "platform_fee_payments" USING btree ("dodo_payment_id");--> statement-breakpoint
CREATE INDEX "platform_fee_payments_board_idx" ON "platform_fee_payments" USING btree ("board_id");