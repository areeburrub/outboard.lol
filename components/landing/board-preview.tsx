import { LeaderboardTable } from "@/components/board/leaderboard-table";

const rows = [
  {
    rank: 1,
    name: "see.io",
    handle: "see.io",
    description: "Watch any website change. Get pinged when it does.",
    faviconUrl: "/preview/see.io.png",
    bidCents: 1_401_800,
    claimCents: 1_402_300,
    clickCount: 18420,
  },
  {
    rank: 2,
    name: "joni.ai",
    handle: "joni.ai",
    description: "AI agents that ship the boring work.",
    faviconUrl: "/preview/joni.ai.png",
    bidCents: 920_000,
    claimCents: 920_100,
    clickCount: 9033,
  },
  {
    rank: 3,
    name: "builder.dev",
    handle: "builder.dev",
    description: "Ship the thing. Then ship the next one.",
    faviconUrl: "/preview/builder.dev.svg",
    bidCents: 184_000,
    claimCents: 184_100,
    clickCount: 2411,
  },
  {
    rank: 4,
    name: "shipfast.dev",
    handle: "shipfast.dev",
    description: "A Next.js boilerplate that actually gets you to launch.",
    faviconUrl: "/preview/shipfast.dev.svg",
    bidCents: 42_000,
    claimCents: 42_100,
    clickCount: 880,
  },
  {
    rank: 5,
    name: "niche.tools",
    handle: "niche.tools",
    description: "Small tools for specific jobs.",
    faviconUrl: "/preview/niche.tools.png",
    bidCents: 8500,
    claimCents: 8600,
    clickCount: 142,
  },
];

export function BoardPreview() {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-ob-line bg-ob-surface shadow-[0_24px_60px_-28px_rgba(18,20,26,0.25)]">
      <div className="flex items-center justify-between gap-3 border-b border-ob-line px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="truncate font-mono text-[0.7rem] uppercase tracking-wider text-ob-mute">
            Preview · indie.outboard.lol
          </p>
          <p className="mt-1 text-lg font-bold tracking-[-0.02em] text-ob-ink">
            Outbid the board
          </p>
        </div>
        <span className="rounded-full bg-ob-win px-3 py-1 font-mono text-xs font-semibold text-ob-win-ink">
          live
        </span>
      </div>
      <div className="p-2 sm:p-3">
        <LeaderboardTable rows={rows} interactive framed={false} />
      </div>
    </div>
  );
}
