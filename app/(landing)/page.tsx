import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";

import { BoardPreview } from "@/components/landing/board-preview";
import { ClaimSlugForm } from "@/components/landing/claim-slug-form";
import { Button } from "@/components/ui/button";

const steps: {
  n: string;
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
}[] = [
  {
    n: "01",
    title: "Pick a name",
    body: "Claim niche.outboard.lol in a minute. Your board, your name.",
  },
  {
    n: "02",
    title: "Paste your Dodo key",
    body: "About five minutes. Bids go straight to your Dodo account. We never touch the money.",
    href: "/guide/dodo",
    linkLabel: "How to create a Dodo account",
  },
  {
    n: "03",
    title: "Keep 100%",
    body: "Zero commission on bids. After your board hits $10 in total bids, pay a flat $10 to keep it live.",
  },
];

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero — brand, one headline, support, claim CTA, product board */}
      <section className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-4 pb-16 pt-10 text-center sm:px-8 sm:pb-28 sm:pt-24">
        <p
          className="animate-rise font-display text-[clamp(2.75rem,7vw,4.75rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-ob-ink"
          style={{ animationDelay: "0ms" }}
        >
          outboard
        </p>

        <h1
          className="animate-rise mt-8 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.12] tracking-[-0.025em] text-ob-ink"
          style={{ animationDelay: "80ms" }}
        >
          Your own pay-to-rank board. Live in seconds.
        </h1>
        <p
          className="animate-rise mt-5 max-w-lg text-lg leading-relaxed text-ob-mute sm:text-xl sm:leading-relaxed"
          style={{ animationDelay: "160ms" }}
        >
          Spin up a branded bidding portal. Visitors bid real USD for rank.
          You keep every dollar —{" "}
          <span className="font-semibold text-ob-ink">0% commission</span>.
        </p>

        <ClaimSlugForm />

        <div
          className="animate-rise mt-14 w-full max-w-3xl min-w-0 text-left"
          style={{ animationDelay: "360ms" }}
        >
          <BoardPreview />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="ob-glass border-t border-ob-line/80">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-4 py-16 text-center sm:px-8 sm:py-28">
          <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
            How it works
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-[-0.02em] text-ob-ink">
            Three steps. Same mechanic that went viral.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ob-mute sm:text-lg">
            No ads. No revenue share. Paste your Dodo key, open the board, keep
            the bids.
          </p>

          <ol className="mt-16 grid w-full gap-12 sm:grid-cols-3 sm:gap-0">
            {steps.map((step, i) => (
              <li
                key={step.n}
                className={`px-2 sm:px-10 ${
                  i > 0 ? "sm:border-l sm:border-ob-line" : ""
                }`}
              >
                <span className="font-display text-4xl font-extrabold tracking-[-0.04em] text-ob-ink/15 sm:text-5xl">
                  {step.n}
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em] text-ob-ink">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-[16rem] text-base leading-relaxed text-ob-mute">
                  {step.body}
                </p>
                {"href" in step && step.href ? (
                  <Link
                    href={step.href}
                    className="mt-3 inline-block text-sm font-medium text-ob-win hover:underline"
                  >
                    {step.linkLabel}
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing clarity */}
      <section id="pricing" className="ob-glass border-t border-ob-line/80">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-4 py-16 text-center sm:px-8 sm:py-28">
          <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
            Pricing
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-[-0.02em] text-ob-ink">
            0% commission. One flat fee.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ob-mute sm:text-lg">
            Connect your own Dodo Payments key — about five minutes. Bids go
            to you, not us. We take nothing from each bid. When your board’s
            total bids reach $10, you pay a flat $10 to keep the platform
            running. That’s it.
          </p>

          <div className="mt-16 grid w-full max-w-2xl grid-cols-2">
            <div className="px-4 sm:px-10">
              <p className="font-display text-[clamp(3.5rem,8vw,5.5rem)] font-extrabold leading-none tracking-[-0.05em] text-ob-ink">
                0%
              </p>
              <p className="mt-4 font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
                Commission
              </p>
              <p className="mx-auto mt-2 max-w-[12rem] text-sm leading-relaxed text-ob-mute">
                On every bid. Money never touches us.
              </p>
            </div>
            <div className="border-l border-ob-line px-4 sm:px-10">
              <p className="font-display text-[clamp(3.5rem,8vw,5.5rem)] font-extrabold leading-none tracking-[-0.05em] text-ob-ink">
                $10
              </p>
              <p className="mt-4 font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
                After $10 in bids
              </p>
              <p className="mx-auto mt-2 max-w-[12rem] text-sm leading-relaxed text-ob-mute">
                One flat fee to keep the board live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-ob-line/80 bg-ob-ink text-ob-surface">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start gap-8 px-4 py-16 sm:px-8 sm:py-24 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <p className="font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.025em]">
              Claim your name before someone else does.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ob-surface/65">
              Newsletter ops, niche directories, community leads — if you have
              an audience, you have a board. Zero cut on every bid.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/sign-up" />}
            size="lg"
            className="h-12 w-full gap-2 rounded-full bg-ob-win px-8 text-sm font-semibold text-ob-win-ink transition-transform duration-150 hover:bg-ob-win/90 hover:-translate-y-0.5 active:translate-y-px sm:w-auto"
          >
            Claim your outboard
            <ArrowRightIcon weight="bold" />
          </Button>
        </div>
      </section>
    </main>
  );
}
