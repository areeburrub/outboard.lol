import { RankingIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { ModeToggle } from "@/components/landing/mode-toggle";

const points = [
  { rank: "01", title: "0% commission", bid: "$0", body: "Bids settle in your Dodo account." },
  { rank: "02", title: "Rank is a price", bid: "$5+", body: "Higher bid, higher row." },
  { rank: "03", title: "Flat fee after $10", bid: "$10", body: "Pay once. The board stays live." },
];

type AuthShellProps = {
  mode: "sign-in" | "sign-up";
  slug?: string;
  children: React.ReactNode;
};

export function AuthShell({ mode, slug, children }: AuthShellProps) {
  const headline =
    mode === "sign-up" ? "Claim your board." : "Welcome back.";
  const body =
    mode === "sign-up"
      ? "Name your board, paste a Dodo key, keep every bid."
      : "Your board, your bids, your Dodo key.";

  return (
    <div className="ob-wash grid min-h-dvh overflow-hidden md:grid-cols-[1.05fr_0.95fr] md:gap-2 md:p-2">
      <section className="relative hidden overflow-hidden bg-ob-ink text-ob-surface md:flex md:flex-col md:justify-between md:rounded-[1rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(90% 420px at 50% -80px, color-mix(in srgb, var(--ob-win) 22%, transparent), transparent 72%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-2 px-10 pt-10 lg:px-14">
          <RankingIcon weight="fill" className="size-6 text-ob-win" />
          <span className="font-display text-lg font-bold tracking-[-0.02em]">
            outboard
          </span>
        </div>

        <div className="relative z-10 max-w-lg px-10 py-12 lg:px-14 lg:py-16">
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ob-win uppercase">
            {mode === "sign-up" ? "Get started" : "Sign in"}
          </p>
          {slug ? (
            <p className="mt-4 font-mono text-sm text-ob-surface/70">
              <span className="text-ob-surface">{slug}</span>.outboard.lol
            </p>
          ) : null}
          <h2 className="font-display mt-4 text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] font-bold tracking-[-0.03em]">
            {headline}
          </h2>
          <p className="mt-4 text-base leading-7 text-ob-surface/65">{body}</p>

          <ul className="mt-10 overflow-hidden rounded-[1rem] border border-ob-surface/10">
            {points.map((point, index) => (
              <li
                key={point.rank}
                className={`flex items-center gap-4 px-5 py-4 ${
                  index === 0 ? "bg-ob-win/15" : ""
                } ${index > 0 ? "border-t border-ob-surface/10" : ""}`}
              >
                <span
                  className={`w-8 shrink-0 font-display text-xl font-extrabold tracking-[-0.04em] ${
                    index === 0 ? "text-ob-surface" : "text-ob-surface/40"
                  }`}
                >
                  {point.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold tracking-[-0.02em]">
                    {point.title}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-ob-surface/50">
                    {point.body}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                  {point.bid}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative flex min-h-dvh flex-col overflow-y-auto bg-ob-surface md:min-h-0 md:rounded-[1rem]">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-ob-ink transition-opacity hover:opacity-70 md:invisible"
          >
            <RankingIcon weight="fill" className="size-6 text-ob-win" />
            <span className="font-display text-lg font-bold tracking-[-0.02em]">
              outboard
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link
              href="/"
              className="text-sm font-medium text-ob-mute transition-colors hover:text-ob-ink"
            >
              Home
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </section>
    </div>
  );
}
