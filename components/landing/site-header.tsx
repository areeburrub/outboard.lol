"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { RankingIcon, UserIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { ModeToggle } from "@/components/landing/mode-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ob-line/70 bg-ob-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-ob-ink transition-opacity hover:opacity-70"
        >
          <RankingIcon weight="fill" className="size-6 shrink-0 text-ob-win" />
          <span className="font-display text-lg font-bold tracking-[-0.02em]">
            outboard
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <nav className="hidden items-center gap-5 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ob-mute transition-colors hover:text-ob-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Show when="signed-out">
              <Button
                nativeButton={false}
                render={<Link href="/sign-in" />}
                variant="outline"
                size="lg"
                className="hidden h-10 rounded-full border-ob-line bg-ob-surface/70 px-5 text-sm font-medium backdrop-blur-sm sm:inline-flex"
              >
                Sign in
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/sign-up" />}
                size="lg"
                className="h-10 rounded-full px-4 text-sm font-semibold sm:px-5"
              >
                Sign up
              </Button>
            </Show>
            <Show when="signed-in">
              <Button
                nativeButton={false}
                render={<Link href="/overview" />}
                size="lg"
                className="h-10 gap-2 rounded-full px-3 text-sm font-semibold sm:px-5"
              >
                <UserIcon weight="bold" />
                <span className="hidden sm:inline">Open app</span>
                <span className="sm:hidden">App</span>
              </Button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-8 sm:size-9",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
