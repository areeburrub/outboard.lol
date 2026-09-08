import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";

export const metadata: Metadata = {
  title: "Set up Dodo Payments",
  description:
    "Create a Dodo Payments account, get your API key, and connect it to outboard so bids go straight to you.",
};

export const revalidate = 86400;

const steps = [
  {
    n: "01",
    title: "Create a Dodo Payments account",
    body: (
      <>
        Sign up at{" "}
        <a
          href="https://app.dodopayments.com/signup"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ob-win hover:underline"
        >
          app.dodopayments.com
        </a>
        . Finish merchant onboarding so your account can accept card payments.
      </>
    ),
  },
  {
    n: "02",
    title: "Create an API key",
    body: (
      <>
        In the Dodo dashboard open{" "}
        <span className="font-medium text-ob-ink">Developers → API keys</span>{" "}
        and create a secret key. That key is yours — outboard uses it only to
        take bids into <span className="font-medium text-ob-ink">your</span>{" "}
        Dodo account.
      </>
    ),
  },
  {
    n: "03",
    title: "Paste the key on Payments",
    body: (
      <>
        Back on{" "}
        <Link href="/payments" className="font-medium text-ob-win hover:underline">
          Payments
        </Link>
        , paste the key and hit connect. We validate it, create a product for
        bids, register a webhook, and save the connection. You will see each
        step while it runs.
      </>
    ),
  },
  {
    n: "04",
    title: "What we charge (once)",
    body: (
      <>
        Outboard takes <span className="font-medium text-ob-ink">0%</span> of
        every bid. When your board’s total bids reach $10, new bidding{" "}
        <span className="font-medium text-ob-ink">pauses</span> until you pay a
        flat <span className="font-medium text-ob-ink">$10</span> to outboard —
        or you can <span className="font-medium text-ob-ink">prepay</span> that
        fee on Payments so the board never pauses. After it is paid, the board
        stays live forever. No recurring platform fee.
      </>
    ),
  },
];

export default function DodoGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 py-16 sm:px-8 sm:py-24">
      <p className="font-mono text-xs font-semibold tracking-wider text-ob-mute uppercase">
        Guide
      </p>
      <h1 className="mt-4 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-[-0.02em] text-ob-ink">
        Set up Dodo Payments
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ob-mute sm:text-lg">
        Outboard uses{" "}
        <span className="font-medium text-ob-ink">Dodo Payments</span> so
        visitors can bid on your board. You paste your own API key. Bids settle
        in your Dodo account — we never hold that money. You keep 100% of every
        bid.
      </p>

      <div className="mt-8 rounded-[1rem] border border-ob-line bg-ob-surface px-5 py-5 text-sm leading-relaxed text-ob-mute">
        <p className="font-medium text-ob-ink">Transparent by design</p>
        <p className="mt-2">
          Your key stays encrypted on our side. Checkout and payouts run on
          Dodo under your merchant account. Outboard only gets involved for the
          one-time $10 platform fee after your board hits $10 in total bids.
        </p>
      </div>

      <ol className="mt-14 space-y-12">
        {steps.map((step) => (
          <li key={step.n}>
            <span className="font-display text-4xl font-extrabold tracking-[-0.04em] text-ob-ink/15">
              {step.n}
            </span>
            <h2 className="mt-3 font-display text-xl font-bold tracking-[-0.02em] text-ob-ink">
              {step.title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-ob-mute">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-16 flex flex-col gap-4 border-t border-ob-line pt-10 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/payments"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ob-ink px-6 text-sm font-semibold text-ob-surface"
        >
          Back to Payments
          <ArrowRightIcon weight="bold" />
        </Link>
        <a
          href="https://app.dodopayments.com/signup"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-full border border-ob-line px-6 text-sm font-medium text-ob-ink"
        >
          Create Dodo account
        </a>
      </div>
    </main>
  );
}
