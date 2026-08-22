"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  GlobeIcon,
  MinusIcon,
  PlusIcon,
} from "@phosphor-icons/react";

import type { LeaderboardRow } from "@/components/board/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { predictedRank } from "@/lib/board-rows";
import { parseListingInput } from "@/lib/listing-input";
import {
  MIN_REBID_DELTA_CENTS,
  centsToDollars,
  formatUsdFromCents,
} from "@/lib/money";
import { cn } from "@/lib/utils";

function googleFavicon(displayUrl: string) {
  try {
    const host = new URL(displayUrl).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return null;
  }
}

function InputFavicon({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <GlobeIcon
        weight="bold"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ob-mute"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- listing / google favicon
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 rounded-[3px] object-contain"
    />
  );
}

export function BidForm({
  bidPath,
  minDollars,
  suggestedTakeFirst,
  amountDollars,
  onAmountChange,
  listingBids = [],
  listings = [],
  listingFocusToken = 0,
}: {
  /** Absolute path for checkout POST, e.g. `/bid` (tenant) or `/b/slug/bid` (apex). */
  bidPath: string;
  minDollars: number;
  suggestedTakeFirst: number;
  amountDollars: number;
  onAmountChange: (dollars: number) => void;
  listingBids?: number[];
  listings?: LeaderboardRow[];
  listingFocusToken?: number;
}) {
  const [listing, setListing] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const amountId = useId();
  const listingId = useId();

  const parsed = useMemo(() => parseListingInput(listing), [listing]);
  const existing = useMemo(() => {
    if (!parsed.ok) {
      return null;
    }
    return (
      listings.find((row) => row.canonicalKey === parsed.canonicalKey) ?? null
    );
  }, [listings, parsed]);

  const existingDollars = existing
    ? Math.ceil(centsToDollars(existing.bidCents))
    : 0;
  const floorDollars = existing
    ? existingDollars + MIN_REBID_DELTA_CENTS / 100
    : minDollars;
  const payMoreDollars = existing
    ? Math.max(0, amountDollars - existingDollars)
    : amountDollars;
  const siteHost =
    parsed.ok && !parsed.displayUrl.includes(" ")
      ? (() => {
          try {
            return new URL(parsed.displayUrl).hostname.replace(/^www\./, "");
          } catch {
            return "";
          }
        })()
      : "";
  const looksLikeSite = siteHost.includes(".");
  const faviconSrc = existing?.faviconUrl
    ? existing.faviconUrl
    : parsed.ok && looksLikeSite
      ? googleFavicon(parsed.displayUrl)
      : null;

  const amountCents = amountDollars * 100;
  const others = existing
    ? listings
        .filter((row) => row.canonicalKey !== existing.canonicalKey)
        .map((row) => row.bidCents)
    : listingBids;
  const nextRank = predictedRank(amountCents, others);
  const takesFirst = nextRank === 1;
  const canDecrement = amountDollars > floorDollars;
  const digits = String(amountDollars).length;

  useEffect(() => {
    if (listingFocusToken === 0) {
      return;
    }
    document.getElementById(listingId)?.focus();
  }, [listingFocusToken, listingId]);

  useEffect(() => {
    if (existing && amountDollars < floorDollars) {
      onAmountChange(floorDollars);
    }
  }, [existing, floorDollars, amountDollars, onAmountChange]);

  function setAmount(next: number) {
    onAmountChange(Math.max(floorDollars, Math.floor(next)));
  }

  function bump(delta: number) {
    setAmount(amountDollars + delta);
    setTick((n) => n + 1);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(bidPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing,
          amountDollars,
        }),
      });
      const data = (await res.json()) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  const headline = existing
    ? `Raise to #${nextRank} for`
    : takesFirst
      ? "Claim #1 for"
      : `Take #${nextRank} for`;

  const cta = existing
    ? `Pay ${formatUsdFromCents(payMoreDollars * 100)} more`
    : takesFirst
      ? "Take #1"
      : "Place bid";

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mx-auto flex w-full max-w-xl flex-col items-center text-center"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <h2 className="font-display text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-[-0.03em] text-ob-ink">
          {headline}
        </h2>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Decrease bid by one dollar"
            disabled={loading || !canDecrement}
            onClick={() => bump(-1)}
            className="flex size-10 items-center justify-center rounded-full text-ob-mute transition-colors hover:bg-ob-paper hover:text-ob-ink disabled:pointer-events-none disabled:opacity-25"
          >
            <MinusIcon weight="bold" className="size-5" />
          </button>
          <label htmlFor={amountId} className="sr-only">
            Amount in dollars
          </label>
          <div
            key={tick}
            className={cn(
              "animate-bid-tick flex items-baseline text-ob-ink",
              takesFirst && "text-ob-win",
            )}
          >
            <span className="font-mono text-[clamp(2rem,6vw,3.25rem)] font-bold leading-none tracking-tight">
              $
            </span>
            <input
              id={amountId}
              type="number"
              inputMode="numeric"
              min={floorDollars}
              step={1}
              value={amountDollars}
              onChange={(e) => setAmount(Number(e.target.value) || floorDollars)}
              required
              disabled={loading}
              style={{ width: `${Math.max(digits, 1) + 0.35}ch` }}
              className="ob-amount-input border-0 bg-transparent p-0 font-mono text-[clamp(2.5rem,7vw,3.75rem)] leading-none font-extrabold tabular-nums tracking-[-0.05em] outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-8 disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            aria-label="Increase bid by one dollar"
            disabled={loading}
            onClick={() => bump(1)}
            className="flex size-10 items-center justify-center rounded-full text-ob-mute transition-colors hover:bg-ob-paper hover:text-ob-ink disabled:pointer-events-none disabled:opacity-25"
          >
            <PlusIcon weight="bold" className="size-5" />
          </button>
        </div>
      </div>

      <p className="mt-4 max-w-md text-sm leading-relaxed text-ob-mute">
        {existing ? (
          <>
            Already on the board at {formatUsdFromCents(existing.bidCents)}.
            Checkout only charges the{" "}
            {formatUsdFromCents(payMoreDollars * 100)} difference.
          </>
        ) : (
          <>
            New spots start at {formatUsdFromCents(minDollars * 100)}. Paying less
            than the #1 price still puts you on the board at whatever place that
            bid can take.
            {suggestedTakeFirst > minDollars ? (
              <> #1 is {formatUsdFromCents(suggestedTakeFirst * 100)}.</>
            ) : null}
          </>
        )}
      </p>

      <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        <label htmlFor={listingId} className="sr-only">
          Website URL
        </label>
        <div className="relative min-w-0 flex-1">
          <InputFavicon src={faviconSrc} />
          <Input
            id={listingId}
            value={listing}
            onChange={(e) => setListing(e.target.value)}
            placeholder="yoursite.com"
            required
            disabled={loading}
            className="h-14 rounded-full bg-ob-surface pr-5 pl-11 sm:rounded-r-none sm:border-r-0"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !listing.trim() || (existing ? payMoreDollars < 1 : false)}
          className={cn(
            "h-14 gap-2 rounded-full px-6 text-sm font-semibold sm:rounded-l-none sm:px-7",
            takesFirst && "bg-ob-win text-ob-win-ink hover:bg-ob-win/90",
          )}
        >
          {loading ? <Spinner /> : null}
          {loading ? "Redirecting…" : cta}
          {!loading ? <ArrowRightIcon weight="bold" /> : null}
        </Button>
      </div>

      <p className="mt-3 font-mono text-xs text-ob-mute">
        {existing
          ? `Raising ${existing.handle}. Same URL, higher total.`
          : "Already on the list? Same URL raises your bid. You only pay the difference."}
      </p>

      {error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : null}
    </form>
  );
}
