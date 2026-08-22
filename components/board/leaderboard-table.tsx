"use client";

import { useState } from "react";
import { CursorClickIcon, LinkSimpleIcon } from "@phosphor-icons/react";

import { formatUsdFromCents } from "@/lib/money";
import { cn } from "@/lib/utils";

export type LeaderboardRow = {
  id?: string;
  rank: number;
  name: string;
  handle: string;
  canonicalKey?: string;
  description?: string | null;
  faviconUrl?: string | null;
  bidCents: number;
  claimCents: number;
  href?: string;
  clickCount?: number;
};

function Favicon({ src, name }: { src?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const letter = (name.replace(/^@/, "")[0] ?? "?").toUpperCase();

  return (
    <span className="relative block size-14 shrink-0 overflow-hidden rounded-lg border border-ob-line bg-ob-paper">
      {!src || failed ? (
        <span
          aria-hidden
          className="flex size-full items-center justify-center font-display text-base font-extrabold text-ob-ink"
        >
          {letter}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary listing origins
        <img
          src={src}
          alt=""
          width={56}
          height={56}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}
    </span>
  );
}

function clickLabel(count: number) {
  return count === 1 ? "1 click" : `${count.toLocaleString("en-US")} clicks`;
}

function LeaderboardCard({
  row,
  showClicks,
  framed,
}: {
  row: LeaderboardRow;
  showClicks: boolean;
  framed: boolean;
}) {
  const isFirst = row.rank === 1;
  const clicks = row.clickCount ?? 0;

  return (
    <article
      className={cn(
        "group relative [content-visibility:auto] [contain-intrinsic-size:0_128px]",
        framed
          ? "rounded-[1rem] border border-ob-line bg-ob-surface px-3.5 py-3.5 sm:px-5 sm:py-5"
          : "px-3 py-4 sm:px-5 sm:py-5",
        isFirst && "bg-ob-win-soft",
        isFirst && framed && "border-ob-win/30",
      )}
    >
      {row.href ? (
        <a
          href={row.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          aria-label={`Open ${row.name}`}
          className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ob-win/50"
        />
      ) : null}

      <div className="pointer-events-none relative grid grid-cols-[1.75rem_3.5rem_minmax(0,1fr)] items-start gap-x-2.5 sm:grid-cols-[2rem_3.5rem_minmax(0,1fr)] sm:gap-x-3">
        <span
          className={cn(
            "pt-1 text-center font-mono text-lg font-bold tabular-nums tracking-[-0.04em] sm:text-2xl",
            isFirst ? "text-ob-ink" : "text-ob-mute",
          )}
        >
          {row.rank}
        </span>

        <Favicon src={row.faviconUrl} name={row.name} />

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 truncate text-[0.95rem] font-bold tracking-[-0.02em] text-ob-ink sm:text-lg">
              {row.name}
            </p>
            <p
              className={cn(
                "shrink-0 font-mono text-base font-semibold tabular-nums sm:text-lg",
                isFirst ? "text-ob-win" : "text-ob-ink",
              )}
            >
              {formatUsdFromCents(row.bidCents)}
            </p>
          </div>
          {row.description ? (
            <p className="mt-1 line-clamp-2 overflow-hidden text-sm leading-snug text-ob-mute">
              {row.description}
            </p>
          ) : null}
          <p className="mt-1.5 flex min-w-0 items-center gap-2 font-mono text-xs text-ob-mute">
            <span className="inline-flex min-w-0 items-center gap-1 truncate">
              <LinkSimpleIcon weight="bold" className="size-3.5 shrink-0" />
              <span className="truncate">{row.handle}</span>
            </span>
            {showClicks ? (
              <span className="inline-flex shrink-0 items-center gap-1">
                <CursorClickIcon weight="bold" className="size-3.5" />
                {clickLabel(clicks)}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </article>
  );
}

export function LeaderboardTable({
  rows,
  showClicks = true,
  framed = true,
}: {
  rows: LeaderboardRow[];
  interactive?: boolean;
  showClicks?: boolean;
  framed?: boolean;
  onClaimRank?: (claimCents: number) => void;
}) {
  return (
    <div className={framed ? "flex flex-col gap-2.5" : "flex flex-col divide-y divide-ob-line"}>
      {rows.map((row) => (
        <LeaderboardCard
          key={row.id ?? row.rank}
          row={row}
          showClicks={showClicks}
          framed={framed}
        />
      ))}
    </div>
  );
}
