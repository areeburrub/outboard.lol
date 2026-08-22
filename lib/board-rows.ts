import type { LeaderboardRow } from "@/components/board/leaderboard-table";
import type { listings } from "@/lib/db/schema";
import { MIN_BID_CENTS, MIN_REBID_DELTA_CENTS } from "@/lib/money";

type ListingRow = typeof listings.$inferSelect;

export function listingFallbackName(listing: Pick<ListingRow, "kind" | "canonicalKey" | "displayUrl">) {
  if (listing.kind === "handle") {
    return listing.canonicalKey;
  }
  return listing.displayUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function claimCentsForRank(
  index: number,
  totalBidCents: number,
  minBidCents = MIN_BID_CENTS,
) {
  return index === 0
    ? totalBidCents + MIN_REBID_DELTA_CENTS
    : Math.max(totalBidCents + MIN_REBID_DELTA_CENTS, minBidCents);
}

export function toLeaderboardRows(
  rankings: ListingRow[],
  goPrefix: string,
  minBidCents = MIN_BID_CENTS,
): LeaderboardRow[] {
  return rankings.map((listing, index) => ({
    id: listing.id,
    rank: index + 1,
    name: listing.title?.trim() || listingFallbackName(listing),
    handle: listingFallbackName(listing),
    canonicalKey: listing.canonicalKey,
    description: listing.description,
    faviconUrl: listing.faviconUrl,
    bidCents: listing.totalBidCents,
    claimCents: claimCentsForRank(index, listing.totalBidCents, minBidCents),
    clickCount: listing.clickCount,
    href: `${goPrefix}/${listing.id}`,
  }));
}

/** New listing of `amountCents` lands here. Equal bids stay below older rows. */
export function predictedRank(amountCents: number, bidCents: number[]) {
  const index = bidCents.findIndex((bid) => amountCents > bid);
  return index === -1 ? bidCents.length + 1 : index + 1;
}

export function takeFirstDollars(
  topBidCents: number,
  minBidCents = MIN_BID_CENTS,
) {
  if (topBidCents <= 0) {
    return minBidCents / 100;
  }
  return Math.max(
    minBidCents / 100,
    Math.ceil(topBidCents / 100) + MIN_REBID_DELTA_CENTS / 100,
  );
}
