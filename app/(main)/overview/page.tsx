import Link from "next/link";
import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react/ssr";

import { isDodoConnected } from "@/lib/db/boards";
import { getOperatorContext } from "@/lib/db/get-operator";
import { countLiveListings, sumClickCounts } from "@/lib/db/listings";
import {
  FEE_THRESHOLD_CENTS,
  formatUsdFromCents,
  PLATFORM_FEE_CENTS,
} from "@/lib/money";
import { parseClaimSlug } from "@/lib/auth-redirect";
import { publicBoardUrl } from "@/lib/tenant";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug: rawSlug } = await searchParams;
  const { clerkUser, board } = await getOperatorContext(
    parseClaimSlug(rawSlug),
  );
  const name = clerkUser.firstName ?? "there";
  const paymentsReady = isDodoConnected(board);
  const feePaid = board.platformFeeStatus === "paid";
  const feeDue = board.platformFeeStatus === "due";
  const liveCount = await countLiveListings(board.id);
  const clicks = await sumClickCounts(board.id);
  const boardUrl = publicBoardUrl(board.slug);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <div>
        <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
          Overview
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-ob-ink">
          Hey {name}.
        </h1>
        <p className="mt-3 font-mono text-sm text-ob-ink">
          <a
            href={boardUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ob-win"
          >
            {board.slug}.outboard.lol
          </a>
        </p>
      </div>

      {!paymentsReady ? (
        <div
          role="status"
          className="rounded-[1rem] border border-ob-line bg-ob-win-soft/40 px-5 py-5"
        >
          <p className="font-display text-lg font-bold tracking-[-0.02em] text-ob-ink">
            Setup payments to go live
          </p>
          <p className="mt-2 text-sm text-ob-mute">
            One step left. Your board cannot take bids until payments are
            configured.
          </p>

          <ol className="mt-5 space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircleIcon
                weight="fill"
                className="mt-0.5 size-5 shrink-0 text-ob-win"
              />
              <div>
                <p className="text-sm font-medium text-ob-ink">
                  Claim your board
                </p>
                <p className="mt-0.5 font-mono text-xs text-ob-mute">
                  {board.slug}.outboard.lol
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CircleIcon className="mt-0.5 size-5 shrink-0 text-ob-ink/35" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ob-ink">
                  Configure payments
                </p>
                <p className="mt-0.5 text-sm text-ob-mute">
                  Connect Dodo Payments to start taking bids. Heads up: when
                  total bids hit {formatUsdFromCents(FEE_THRESHOLD_CENTS)},
                  bidding pauses until you pay a one-time{" "}
                  {formatUsdFromCents(PLATFORM_FEE_CENTS)} fee — or prepay on
                  Payments so it never pauses.
                </p>
                <Link
                  href="/payments"
                  className="mt-3 inline-flex h-11 items-center rounded-full bg-ob-ink px-5 text-sm font-semibold text-ob-surface"
                >
                  Setup payments
                </Link>
              </div>
            </li>
          </ol>
        </div>
      ) : null}

      {paymentsReady && feeDue ? (
        <div
          role="alert"
          className="rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-5"
        >
          <p className="font-display text-lg font-bold tracking-[-0.02em] text-ob-ink">
            Bidding is paused
          </p>
          <p className="mt-2 text-sm text-ob-mute">
            Total bids crossed {formatUsdFromCents(FEE_THRESHOLD_CENTS)}. Pay
            the one-time {formatUsdFromCents(PLATFORM_FEE_CENTS)} platform fee
            to unpause. Existing listings stay visible.
          </p>
          <Link
            href="/payments"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-ob-ink px-5 text-sm font-semibold text-ob-surface"
          >
            Pay on Payments
          </Link>
        </div>
      ) : null}

      {paymentsReady && !feePaid && !feeDue ? (
        <div
          role="status"
          className="rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-5"
        >
          <p className="font-display text-lg font-bold tracking-[-0.02em] text-ob-ink">
            Avoid a bidding pause
          </p>
          <p className="mt-2 text-sm text-ob-mute">
            When total bids reach {formatUsdFromCents(FEE_THRESHOLD_CENTS)},
            new bids pause until you pay a flat{" "}
            {formatUsdFromCents(PLATFORM_FEE_CENTS)}. You can prepay that fee
            anytime so the board never stops.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/payments"
              className="inline-flex h-11 items-center rounded-full bg-ob-ink px-5 text-sm font-semibold text-ob-surface"
            >
              Prepay {formatUsdFromCents(PLATFORM_FEE_CENTS)}
            </Link>
            <p className="self-center font-mono text-xs text-ob-mute">
              {formatUsdFromCents(board.totalBidsCents)} /{" "}
              {formatUsdFromCents(FEE_THRESHOLD_CENTS)} in bids so far
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ob-mute">
            Total bids
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-ob-ink">
            {formatUsdFromCents(board.totalBidsCents)}
          </p>
        </div>
        <div className="rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ob-mute">
            Live listings
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-ob-ink">
            {liveCount}
          </p>
        </div>
        <div className="rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-wider text-ob-mute">
            Clicks
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-ob-ink">
            {clicks}
          </p>
        </div>
      </div>

      {liveCount === 0 ? (
        <p className="max-w-md text-base leading-relaxed text-ob-mute">
          {paymentsReady
            ? "Your public board is empty until the first bid clears."
            : "Stats will show up here once people start bidding."}
        </p>
      ) : (
        <p className="text-sm text-ob-mute">
          See the live ranking on{" "}
          <Link href="/leaderboard" className="text-ob-win hover:underline">
            Leaderboard
          </Link>{" "}
          or{" "}
          <a href={boardUrl} className="text-ob-win hover:underline">
            the public board
          </a>
          .
        </p>
      )}
    </main>
  );
}
