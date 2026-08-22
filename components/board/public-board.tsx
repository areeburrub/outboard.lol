"use client";

import { useEffect, useState } from "react";

import { BidForm } from "@/components/board/bid-form";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/board/leaderboard-table";
import { centsToDollars } from "@/lib/money";

export function PublicBoard({
  bidPath,
  minDollars,
  suggestedTakeFirst,
  canBid,
  rows,
}: {
  bidPath: string;
  minDollars: number;
  suggestedTakeFirst: number;
  canBid: boolean;
  rows: LeaderboardRow[];
}) {
  const [amountDollars, setAmountDollars] = useState(suggestedTakeFirst);
  const [listingFocusToken, setListingFocusToken] = useState(0);

  useEffect(() => {
    setAmountDollars(suggestedTakeFirst);
  }, [suggestedTakeFirst, minDollars]);

  function claimRank(claimCents: number) {
    setAmountDollars(Math.max(minDollars, Math.ceil(centsToDollars(claimCents))));
    setListingFocusToken((token) => token + 1);
    document.getElementById("claim")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="flex flex-col gap-12">
      {canBid ? (
        <section id="claim" className="scroll-mt-6">
          <BidForm
            key={`${minDollars}-${suggestedTakeFirst}`}
            bidPath={bidPath}
            minDollars={minDollars}
            suggestedTakeFirst={suggestedTakeFirst}
            amountDollars={amountDollars}
            onAmountChange={setAmountDollars}
            listingBids={rows.map((row) => row.bidCents)}
            listings={rows}
            listingFocusToken={listingFocusToken}
          />
        </section>
      ) : null}

      <section id="leaderboard" className="scroll-mt-6">
        {rows.length === 0 ? (
          <div className="rounded-[1rem] border border-dashed border-ob-line bg-ob-surface/70 px-6 py-16 text-center">
            <p className="font-display text-xl font-bold text-ob-ink">
              Empty board
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ob-mute">
              Nothing ranks until a payment succeeds. Be the first listing.
            </p>
          </div>
        ) : (
          <LeaderboardTable
            rows={rows}
            interactive={canBid}
            onClaimRank={canBid ? claimRank : undefined}
          />
        )}
      </section>
    </div>
  );
}
