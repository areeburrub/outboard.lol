import { RulesDialog } from "@/components/board/rules-dialog";
import { ModeToggle } from "@/components/landing/mode-toggle";
import type { BoardLink } from "@/lib/db/schema";

export function PublicNav({
  name,
  slug,
  tagline,
  links,
  rules,
}: {
  name: string;
  slug: string;
  tagline?: string | null;
  links: BoardLink[];
  rules?: string;
}) {
  const hasRules = Boolean(rules?.trim());
  return (
    <header className="border-b border-ob-line/80">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold tracking-[-0.02em] text-ob-ink sm:text-2xl">
            {name}
          </h1>
          <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider text-ob-mute">
            {slug}.outboard.lol
          </p>
          {tagline ? (
            <p className="mt-1 text-sm text-ob-mute">{tagline}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {links.length > 0 || hasRules ? (
            <nav
              aria-label="Board"
              className="flex flex-wrap items-center gap-x-4 gap-y-1"
            >
              {links.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-ob-ink hover:text-ob-win"
                >
                  {link.label}
                </a>
              ))}
              {hasRules && rules ? <RulesDialog rules={rules} /> : null}
            </nav>
          ) : null}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
