import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaidReturnHandler } from "@/components/board/paid-return-handler";
import { PublicBoard } from "@/components/board/public-board";
import { PublicNav } from "@/components/board/public-nav";
import {
  listingFallbackName,
  takeFirstDollars,
  toLeaderboardRows,
} from "@/lib/board-rows";
import {
  boardLinks,
  boardMinBidCents,
  getBoardBySlug,
  isDodoConnected,
} from "@/lib/db/boards";
import { listLiveRankings } from "@/lib/db/listings";
import { FEE_THRESHOLD_CENTS, formatUsdFromCents } from "@/lib/money";
import {
  boardOgImagePath,
  boardShareMeta,
} from "@/lib/og/board-share";
import { OG_IMAGE_SIZE } from "@/lib/site";
import { normalizeSlug } from "@/lib/slug";
import { publicBoardUrl } from "@/lib/tenant";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = normalizeSlug((await params).slug);
  const board = await getBoardBySlug(slug);
  if (!board) {
    return {
      title: "Board not found",
      robots: { index: false, follow: false },
    };
  }

  const rankings = await listLiveRankings(board.id);
  const top = rankings[0];
  const share = boardShareMeta({
    name: board.name,
    slug: board.slug,
    tagline: board.tagline,
    topName: top ? top.title?.trim() || listingFallbackName(top) : null,
    topBidCents: top?.totalBidCents ?? null,
  });
  const url = publicBoardUrl(slug);
  const ogImage = {
    url: boardOgImagePath(slug),
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    alt: share.alt,
  };

  return {
    title: share.title,
    description: share.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "outboard",
      title: `${share.title} · outboard`,
      description: share.description,
      url,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${share.title} · outboard`,
      description: share.description,
      images: [boardOgImagePath(slug)],
    },
  };
}

export default async function PublicBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = normalizeSlug(raw);
  const board = await getBoardBySlug(slug);
  if (!board) {
    notFound();
  }

  const bidPath = publicBoardUrl(slug, "/bid");
  const goPrefix = publicBoardUrl(slug, "/go");

  const rankings = await listLiveRankings(board.id);
  const topBid = rankings[0]?.totalBidCents ?? 0;
  const feeDue = board.platformFeeStatus === "due";
  const connected = isDodoConnected(board);
  const canBid = connected && !feeDue;
  const minBidCents = boardMinBidCents(board);
  const rows = toLeaderboardRows(rankings, goPrefix, minBidCents);
  const links = boardLinks(board);
  const rules = board.rules?.trim() || "";

  return (
    <div className="ob-wash flex min-h-full flex-1 flex-col">
      <PublicNav
        name={board.name}
        slug={slug}
        tagline={board.tagline}
        links={links}
        rules={rules}
      />

      {feeDue ? (
        <div className="border-b border-ob-line bg-ob-surface">
          <p className="mx-auto max-w-4xl px-4 py-3 text-center text-sm text-ob-ink sm:px-6">
            Bidding is paused until the operator pays the flat{" "}
            {formatUsdFromCents(FEE_THRESHOLD_CENTS)} platform fee. Listings stay
            visible.
          </p>
        </div>
      ) : null}

      {!connected ? (
        <div className="border-b border-ob-line bg-ob-surface">
          <p className="mx-auto max-w-4xl px-4 py-3 text-center text-sm text-ob-ink sm:px-6">
            This board is not accepting bids yet. The operator still needs to
            set up payments.
          </p>
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <PaidReturnHandler slug={slug} />

        <PublicBoard
          key={`${minBidCents}-${topBid}-${rules.length}-${links.length}`}
          bidPath={bidPath}
          minDollars={minBidCents / 100}
          suggestedTakeFirst={takeFirstDollars(topBid, minBidCents)}
          canBid={canBid}
          rows={rows}
        />

        <p className="pt-4 text-center font-mono text-xs text-ob-mute">
          Powered by{" "}
          <Link href="https://outboard.lol" className="hover:text-ob-ink">
            outboard.lol
          </Link>
        </p>
      </main>
    </div>
  );
}
