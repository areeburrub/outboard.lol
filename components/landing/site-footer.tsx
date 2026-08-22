import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ob-line/80">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-base font-bold tracking-[-0.02em] text-ob-ink">
          outboard
        </p>
        <p className="font-mono text-xs text-ob-mute">
          <Link href="/" className="hover:text-ob-ink">
            outboard.lol
          </Link>
          <span className="mx-2 text-ob-line">·</span>
          <Link href="/guide/dodo" className="hover:text-ob-ink">
            Dodo setup
          </Link>
          <span className="mx-2 text-ob-line">·</span>
          Rank is a price
        </p>
      </div>
    </footer>
  );
}
