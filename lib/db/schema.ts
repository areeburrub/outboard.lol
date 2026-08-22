import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export type BoardLink = {
  label: string;
  url: string;
};

export const BOARD_STATUSES = ["setup", "live", "paused"] as const;
export type BoardStatus = (typeof BOARD_STATUSES)[number];
export const boardStatusEnum = pgEnum("board_status", BOARD_STATUSES);

export const PLATFORM_FEE_STATUSES = ["none", "due", "paid"] as const;
export type PlatformFeeStatus = (typeof PLATFORM_FEE_STATUSES)[number];
export const platformFeeStatusEnum = pgEnum(
  "platform_fee_status",
  PLATFORM_FEE_STATUSES,
);

export const DODO_SETUP_MODES = ["auto", "manual"] as const;
export type DodoSetupMode = (typeof DODO_SETUP_MODES)[number];
export const dodoSetupModeEnum = pgEnum("dodo_setup_mode", DODO_SETUP_MODES);

export const LISTING_KINDS = ["url", "handle"] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];
export const listingKindEnum = pgEnum("listing_kind", LISTING_KINDS);

export const LISTING_STATUSES = ["live", "removed"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];
export const listingStatusEnum = pgEnum("listing_status", LISTING_STATUSES);

export const BID_STATUSES = ["succeeded"] as const;
export type BidStatus = (typeof BID_STATUSES)[number];
export const bidStatusEnum = pgEnum("bid_status", BID_STATUSES);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  username: text("username"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const boards = pgTable(
  "boards",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    minBidCents: integer("min_bid_cents").notNull().default(500),
    rules: text("rules"),
    links: jsonb("links").$type<BoardLink[]>().notNull().default([]),
    status: boardStatusEnum("status").notNull().default("setup"),
    totalBidsCents: integer("total_bids_cents").notNull().default(0),
    platformFeeStatus: platformFeeStatusEnum("platform_fee_status")
      .notNull()
      .default("none"),
    dodoSetupMode: dodoSetupModeEnum("dodo_setup_mode"),
    dodoApiKeyEncrypted: text("dodo_api_key_encrypted"),
    dodoWebhookSecretEncrypted: text("dodo_webhook_secret_encrypted"),
    dodoProductId: text("dodo_product_id"),
    dodoWebhookId: text("dodo_webhook_id"),
    dodoKeyLast4: text("dodo_key_last4"),
    dodoConnectedAt: timestamp("dodo_connected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("boards_slug_uidx").on(table.slug),
    uniqueIndex("boards_owner_id_uidx").on(table.ownerId),
    index("boards_owner_id_idx").on(table.ownerId),
  ],
);

export const listings = pgTable(
  "listings",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    canonicalKey: text("canonical_key").notNull(),
    displayUrl: text("display_url").notNull(),
    kind: listingKindEnum("kind").notNull(),
    title: text("title"),
    description: text("description"),
    faviconUrl: text("favicon_url"),
    metaFetchedAt: timestamp("meta_fetched_at", { withTimezone: true }),
    totalBidCents: integer("total_bid_cents").notNull().default(0),
    clickCount: integer("click_count").notNull().default(0),
    status: listingStatusEnum("status").notNull().default("live"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("listings_board_canonical_uidx").on(
      table.boardId,
      table.canonicalKey,
    ),
    index("listings_board_rank_idx").on(
      table.boardId,
      table.status,
      table.totalBidCents,
      table.createdAt,
    ),
  ],
);

export const bids = pgTable(
  "bids",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    newTotalCents: integer("new_total_cents").notNull(),
    dodoPaymentId: text("dodo_payment_id").notNull(),
    bidderEmail: text("bidder_email"),
    status: bidStatusEnum("status").notNull().default("succeeded"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("bids_dodo_payment_id_uidx").on(table.dodoPaymentId),
    index("bids_board_created_idx").on(table.boardId, table.createdAt),
    index("bids_listing_id_idx").on(table.listingId),
  ],
);

export const clicks = pgTable(
  "clicks",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("clicks_board_created_idx").on(table.boardId, table.createdAt),
    index("clicks_listing_id_idx").on(table.listingId),
  ],
);

export const platformFeePayments = pgTable(
  "platform_fee_payments",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull().default(1000),
    dodoPaymentId: text("dodo_payment_id").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("platform_fee_payments_dodo_payment_id_uidx").on(
      table.dodoPaymentId,
    ),
    index("platform_fee_payments_board_idx").on(table.boardId),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  board: one(boards, {
    fields: [users.id],
    references: [boards.ownerId],
  }),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, {
    fields: [boards.ownerId],
    references: [users.id],
  }),
  listings: many(listings),
  bids: many(bids),
  clicks: many(clicks),
  platformFeePayments: many(platformFeePayments),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  board: one(boards, {
    fields: [listings.boardId],
    references: [boards.id],
  }),
  bids: many(bids),
  clicks: many(clicks),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  board: one(boards, {
    fields: [bids.boardId],
    references: [boards.id],
  }),
  listing: one(listings, {
    fields: [bids.listingId],
    references: [listings.id],
  }),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  board: one(boards, {
    fields: [clicks.boardId],
    references: [boards.id],
  }),
  listing: one(listings, {
    fields: [clicks.listingId],
    references: [listings.id],
  }),
}));

export const platformFeePaymentsRelations = relations(
  platformFeePayments,
  ({ one }) => ({
    board: one(boards, {
      fields: [platformFeePayments.boardId],
      references: [boards.id],
    }),
  }),
);
