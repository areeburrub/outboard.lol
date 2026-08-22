import { listingFallbackName } from "@/lib/board-rows";
import { boardMinBidCents, getBoardBySlug } from "@/lib/db/boards";
import { listLiveRankings } from "@/lib/db/listings";
import { formatUsdFromCents } from "@/lib/money";
import { normalizeSlug } from "@/lib/slug";

export type BoardOgRow = {
  rank: number;
  name: string;
  handle: string;
  description: string | null;
  bidLabel: string;
  letter: string;
};

export type BoardOgData =
  | { kind: "missing"; slug: string }
  | {
      kind: "board";
      name: string;
      slug: string;
      tagline: string | null;
      status: string;
      minBidLabel: string;
      listingCount: number;
      topBidCents: number | null;
      rows: BoardOgRow[];
    };

export function boardOgImagePath(slug: string) {
  return `/b/${normalizeSlug(slug)}/opengraph-image`;
}

export function boardTwitterImagePath(slug: string) {
  return `/b/${normalizeSlug(slug)}/twitter-image`;
}

function clipName(value: string, max = 42) {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function boardShareMeta(input: {
  name: string;
  slug: string;
  tagline?: string | null;
  topName?: string | null;
  topBidCents?: number | null;
}) {
  const title = input.name.trim() || input.slug;
  const host = `${input.slug}.outboard.lol`;
  const tagline = input.tagline?.trim() || null;
  const topName = input.topName ? clipName(input.topName) : null;
  const description =
    tagline ||
    (topName && input.topBidCents != null
      ? `#1 ${topName} at ${formatUsdFromCents(input.topBidCents)}. Bid USD for rank on ${host}.`
      : `Pay-to-rank board at ${host}. Visitors bid real USD for rank.`);

  return {
    title,
    description,
    alt: `${title} — pay-to-rank board on outboard`,
    host,
  };
}

export function letterFromName(name: string) {
  const match = name.replace(/^@/, "").match(/[A-Za-z0-9]/);
  return (match?.[0] ?? "?").toUpperCase();
}

export async function loadBoardOgData(rawSlug: string): Promise<BoardOgData> {
  const slug = normalizeSlug(rawSlug);
  const board = await getBoardBySlug(slug);
  if (!board) {
    return { kind: "missing", slug };
  }

  const rankings = await listLiveRankings(board.id);
  const rows: BoardOgRow[] = rankings.slice(0, 3).map((listing, index) => {
    const name = listing.title?.trim() || listingFallbackName(listing);
    return {
      rank: index + 1,
      name,
      handle: listingFallbackName(listing),
      description: listing.description,
      bidLabel: formatUsdFromCents(listing.totalBidCents),
      letter: letterFromName(name),
    };
  });

  return {
    kind: "board",
    name: board.name,
    slug: board.slug,
    tagline: board.tagline,
    status: board.status,
    minBidLabel: formatUsdFromCents(boardMinBidCents(board)),
    listingCount: rankings.length,
    topBidCents: rankings[0]?.totalBidCents ?? null,
    rows,
  };
}

