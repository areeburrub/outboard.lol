import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon } from "@phosphor-icons/react/ssr";

import { CleanFeeReturnUrl } from "@/components/payments/clean-fee-return-url";
import { ConfettiBurst } from "@/components/confetti-burst";
import { DodoConnectForm } from "@/components/payments/dodo-connect-form";
import { PlatformFeePayButton } from "@/components/payments/platform-fee-button";
import { reconcilePlatformFeeFromPaymentId } from "@/lib/db/apply-platform-fee";
import { listBidsForBoard } from "@/lib/db/bids";
import { getBoardById, isDodoConnected } from "@/lib/db/boards";
import { getOperatorContext } from "@/lib/db/get-operator";
import {
  FEE_THRESHOLD_CENTS,
  formatUsdFromCents,
  PLATFORM_FEE_CENTS,
} from "@/lib/money";
import { publicBoardUrl } from "@/lib/tenant";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    fee?: string;
    payment_id?: string;
    status?: string;
    email?: string;
  }>;
}) {
  const query = await searchParams;
  const { board: initialBoard } = await getOperatorContext();

  let feeNotice: "ok" | "pending" | "error" | null = null;
  let feeError: string | null = null;

  const paymentId = query.payment_id?.trim();
  const looksPaid =
    Boolean(paymentId) &&
    (query.status === "succeeded" ||
      query.fee === "paid" ||
      query.fee === "1");

  if (looksPaid && paymentId) {
    const result = await reconcilePlatformFeeFromPaymentId({
      boardId: initialBoard.id,
      paymentId,
    });
    if (result.ok) {
      feeNotice = "ok";
    } else {
      feeNotice = "error";
      feeError = result.error;
    }
  } else if (query.fee === "paid" && !paymentId) {
    feeNotice = "pending";
  }

  // Fresh board after possible reconcile
  const board = (await getBoardById(initialBoard.id)) ?? initialBoard;
  const connected = isDodoConnected(board);
  const bids = await listBidsForBoard(board.id, 50);
  const progress = Math.min(board.totalBidsCents, FEE_THRESHOLD_CENTS);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-10">
      <CleanFeeReturnUrl
        active={Boolean(paymentId) || query.fee === "paid"}
      />
      <ConfettiBurst active={feeNotice === "ok"} />

      <div>
        <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
          Payments
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-bold tracking-[-0.02em] text-ob-ink">
          {connected ? "Payments" : "Setup payments"}
        </h1>
        {connected ? (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ob-mute">
            Your board is live for bids. Money goes to your Dodo Payments
            account — 0% commission.
          </p>
        ) : (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ob-mute">
            We use{" "}
            <span className="font-medium text-ob-ink">Dodo Payments</span> to
            take bids on your board. You connect your own account with an API
            key so money goes to you — not through us. Zero commission on every
            bid.
          </p>
        )}
      </div>

      {feeNotice === "ok" ? (
        <p className="rounded-[1rem] border border-ob-win/30 bg-ob-win-soft px-5 py-4 text-sm text-ob-ink">
          Platform fee confirmed. Your board will not pause at the bid
          threshold.
        </p>
      ) : null}
      {feeNotice === "pending" ? (
        <p className="rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-4 text-sm text-ob-mute">
          Payment received. If status is not updated yet, refresh in a moment.
        </p>
      ) : null}
      {feeNotice === "error" ? (
        <p className="rounded-[1rem] border border-destructive/30 bg-ob-surface px-5 py-4 text-sm text-destructive">
          Could not confirm platform fee
          {feeError ? `: ${feeError}` : "."} If you were charged, refresh
          shortly or contact support.
        </p>
      ) : null}

      {!connected ? (
        <section className="overflow-hidden rounded-[1rem] border border-ob-line bg-ob-ink text-ob-surface">
          <div className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-10">
            <div className="max-w-md">
              <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-semibold tracking-wider text-ob-surface/55 uppercase">
                <BookOpenIcon weight="bold" className="size-3.5" />
                Guide
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.5rem,3vw,1.875rem)] font-bold leading-tight tracking-[-0.02em]">
                New to Dodo Payments?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ob-surface/70 sm:text-base">
                Follow the short walkthrough to create an account, get your API
                key, and come back here to finish setup.
              </p>
            </div>
            <Link
              href="/guide/dodo"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-ob-win px-6 text-sm font-semibold text-ob-win-ink transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-px"
            >
              Open setup guide
              <ArrowRightIcon weight="bold" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        {!connected ? (
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ob-ink">
            Your API key
          </h2>
        ) : null}
        <DodoConnectForm
          connected={connected}
          keyLast4={board.dodoKeyLast4}
          productId={board.dodoProductId}
          connectedAt={board.dodoConnectedAt?.toISOString() ?? null}
          platformFeePaid={board.platformFeeStatus === "paid"}
        />
      </section>

      {connected && board.platformFeeStatus !== "paid" ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ob-ink">
            Platform fee
          </h2>
          <div className="rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-5">
            {board.platformFeeStatus === "due" ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-md">
                  <p className="inline-flex items-center rounded-full bg-ob-line px-2.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-wider text-ob-ink uppercase">
                    Due — bidding paused
                  </p>
                  <p className="mt-3 text-sm text-ob-mute">
                    Total bids hit {formatUsdFromCents(FEE_THRESHOLD_CENTS)}.
                    Pay the flat {formatUsdFromCents(PLATFORM_FEE_CENTS)} fee
                    to unpause new bids. Existing listings stay visible.
                  </p>
                </div>
                <PlatformFeePayButton mode="due" />
              </div>
            ) : null}

            {board.platformFeeStatus === "none" ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-md">
                  <p className="font-medium text-ob-ink">
                    Prepay to avoid a pause
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ob-mute">
                    When total bids reach{" "}
                    {formatUsdFromCents(FEE_THRESHOLD_CENTS)}, new bidding
                    pauses until you pay a one-time{" "}
                    {formatUsdFromCents(PLATFORM_FEE_CENTS)} platform fee. You
                    can pay that fee now so the board never stops.
                  </p>
                  {board.totalBidsCents > 0 ? (
                    <>
                      <p className="mt-3 font-mono text-xs text-ob-mute">
                        {formatUsdFromCents(board.totalBidsCents)} /{" "}
                        {formatUsdFromCents(FEE_THRESHOLD_CENTS)} toward the
                        pause threshold
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ob-line">
                        <div
                          className="h-full rounded-full bg-ob-win transition-all"
                          style={{
                            width: `${(progress / FEE_THRESHOLD_CENTS) * 100}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
                <PlatformFeePayButton mode="prepay" />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ob-ink">
            Bid payments
          </h2>
          <Link
            href={publicBoardUrl(board.slug)}
            className="font-mono text-xs text-ob-win hover:underline"
          >
            {board.slug}.outboard.lol
          </Link>
        </div>
        {bids.length === 0 ? (
          <p className="text-sm text-ob-mute">
            No successful bids yet. They show up here once a payment clears.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[1rem] border border-ob-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ob-line bg-ob-paper font-mono text-[0.7rem] uppercase tracking-wider text-ob-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Listing</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ob-line">
                {bids.map((bid) => (
                  <tr key={bid.id}>
                    <td className="px-4 py-3 font-mono text-xs text-ob-mute">
                      {bid.createdAt.toLocaleString()}
                    </td>
                    <td className="max-w-[10rem] truncate px-4 py-3 text-ob-ink">
                      {bid.listing?.canonicalKey ?? bid.listingId}
                    </td>
                    <td className="px-4 py-3 font-mono text-ob-ink">
                      {formatUsdFromCents(bid.amountCents)}
                    </td>
                    <td className="hidden max-w-[8rem] truncate px-4 py-3 font-mono text-xs text-ob-mute sm:table-cell">
                      {bid.dodoPaymentId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
