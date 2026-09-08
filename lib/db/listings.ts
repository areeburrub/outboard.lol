import { and, asc, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cache } from "react";

import { db } from "@/lib/db";
import { listings, type ListingKind } from "@/lib/db/schema";
import { fetchListingMeta, type ListingMeta } from "@/lib/listing-meta";

export const listLiveRankings = cache(async function listLiveRankings(
  boardId: string,
) {
  return db.query.listings.findMany({
    where: and(eq(listings.boardId, boardId), eq(listings.status, "live")),
    orderBy: [desc(listings.totalBidCents), asc(listings.createdAt)],
  });
});

export async function getListingById(boardId: string, listingId: string) {
  return db.query.listings.findFirst({
    where: and(eq(listings.id, listingId), eq(listings.boardId, boardId)),
  });
}

export async function getListingByCanonical(
  boardId: string,
  canonicalKey: string,
) {
  return db.query.listings.findFirst({
    where: and(
      eq(listings.boardId, boardId),
      eq(listings.canonicalKey, canonicalKey),
    ),
  });
}

export async function upsertListingOnBid(input: {
  boardId: string;
  canonicalKey: string;
  displayUrl: string;
  kind: ListingKind;
  newTotalCents: number;
  meta?: ListingMeta | null;
}) {
  const existing = await getListingByCanonical(
    input.boardId,
    input.canonicalKey,
  );

  const metaPatch = listingMetaPatch(input.meta);

  if (existing) {
    const [updated] = await db
      .update(listings)
      .set({
        displayUrl: input.displayUrl,
        totalBidCents: input.newTotalCents,
        status: "live",
        updatedAt: new Date(),
        ...metaPatch,
      })
      .where(eq(listings.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(listings)
    .values({
      id: nanoid(),
      boardId: input.boardId,
      canonicalKey: input.canonicalKey,
      displayUrl: input.displayUrl,
      kind: input.kind,
      totalBidCents: input.newTotalCents,
      status: "live",
      ...metaPatch,
    })
    .returning();

  return created;
}

function listingMetaPatch(meta?: ListingMeta | null) {
  if (!meta) {
    return {};
  }
  return {
    ...(meta.title ? { title: meta.title } : {}),
    ...(meta.description ? { description: meta.description } : {}),
    ...(meta.faviconUrl ? { faviconUrl: meta.faviconUrl } : {}),
    metaFetchedAt: new Date(),
  };
}

export async function updateListingMeta(id: string, meta: ListingMeta) {
  const [updated] = await db
    .update(listings)
    .set({
      ...listingMetaPatch(meta),
      updatedAt: new Date(),
    })
    .where(eq(listings.id, id))
    .returning();
  return updated;
}

function needsMeta(listing: {
  title: string | null;
  description: string | null;
  faviconUrl: string | null;
}) {
  return !listing.title || !listing.faviconUrl;
}

export async function hydrateMissingListingMeta<
  T extends {
    id: string;
    kind: ListingKind;
    displayUrl: string;
    canonicalKey: string;
    title: string | null;
    description: string | null;
    faviconUrl: string | null;
  },
>(rows: T[]): Promise<T[]> {
  const missing = rows.filter(needsMeta);
  if (missing.length === 0) {
    return rows;
  }

  const updates = await Promise.all(
    missing.map(async (listing) => {
      const meta = await fetchListingMeta({
        kind: listing.kind,
        displayUrl: listing.displayUrl,
        canonicalKey: listing.canonicalKey,
      });
      const updated = await updateListingMeta(listing.id, meta);
      return updated ?? listing;
    }),
  );

  const byId = new Map(updates.map((row) => [row.id, row]));
  return rows.map((row) => {
    const next = byId.get(row.id);
    return next ? ({ ...row, ...next } as T) : row;
  });
}

export async function incrementListingClicks(boardId: string, listingId: string) {
  const [updated] = await db
    .update(listings)
    .set({
      clickCount: sql`${listings.clickCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(listings.id, listingId), eq(listings.boardId, boardId)))
    .returning();

  return updated;
}

export async function countLiveListings(boardId: string) {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(and(eq(listings.boardId, boardId), eq(listings.status, "live")));
  return rows[0]?.count ?? 0;
}

export async function sumClickCounts(boardId: string) {
  const rows = await db
    .select({
      total: sql<number>`coalesce(sum(${listings.clickCount}), 0)::int`,
    })
    .from(listings)
    .where(eq(listings.boardId, boardId));
  return rows[0]?.total ?? 0;
}
