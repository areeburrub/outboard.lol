import Link from "next/link";

import { LeaderboardTable } from "@/components/board/leaderboard-table";
import { toLeaderboardRows } from "@/lib/board-rows";
import { getOperatorContext } from "@/lib/db/get-operator";
import {
  hydrateMissingListingMeta,
  listLiveRankings,
} from "@/lib/db/listings";
import { publicBoardUrl } from "@/lib/tenant";

export default async function LeaderboardPage() {
  const { board } = await getOperatorContext();
  const rankings = await hydrateMissingListingMeta(
    await listLiveRankings(board.id),
  );
  const rows = toLeaderboardRows(rankings, publicBoardUrl(board.slug, "/go"));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div>
        <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
          Leaderboard
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-ob-ink">
          Rank is a price.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ob-mute">
          Live listings on your board, ordered by bid. Nothing ranks until a
          payment succeeds.{" "}
          <a
            href={publicBoardUrl(board.slug)}
            className="font-medium text-ob-win hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Open public board
          </a>
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[1rem] border border-ob-line bg-ob-surface px-6 py-14 text-center">
          <p className="font-display text-lg font-bold text-ob-ink">
            No listings yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ob-mute">
            Share{" "}
            <span className="font-mono text-ob-ink">
              {board.slug}.outboard.lol
            </span>{" "}
            once Dodo is connected on{" "}
            <Link href="/payments" className="text-ob-win hover:underline">
              Payments
            </Link>
            .
          </p>
        </div>
      ) : (
        <LeaderboardTable rows={rows} showClicks />
      )}
    </main>
  );
}
