"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { sanitizeSlug } from "@/lib/slug";

export function ClaimSlugForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = slug.replace(/^-+|-+$/g, "");
    const href = next ? `/sign-up?slug=${encodeURIComponent(next)}` : "/sign-up";
    router.push(href);
  }

  return (
    <form
      className="animate-rise mx-auto mt-8 w-full min-w-0 max-w-xl"
      style={{ animationDelay: "240ms" }}
      onSubmit={onSubmit}
    >
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-1">
          <p className="truncate text-center font-mono text-xs text-ob-mute sm:hidden">
            <span className="text-ob-ink">{slug || "your-board"}</span>
            .outboard.lol
          </p>
          <label className="flex h-12 min-w-0 w-full items-center overflow-hidden rounded-full border border-ob-line bg-ob-surface px-4 text-left shadow-[0_1px_0_rgba(18,20,26,0.03)] sm:px-5">
            <span className="sr-only">Board name</span>
            <input
              name="slug"
              value={slug}
              onChange={(event) => setSlug(sanitizeSlug(event.target.value))}
              placeholder="your-board"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              className="min-w-0 flex-1 bg-transparent font-mono text-base text-ob-ink outline-none placeholder:text-ob-mute/70 sm:text-sm"
            />
            <span className="ml-1.5 hidden shrink-0 font-mono text-sm text-ob-mute sm:inline">
              .outboard.lol
            </span>
          </label>
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full gap-2 rounded-full px-6 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-px sm:w-auto sm:px-8"
        >
          <span className="sm:hidden">Claim yours</span>
          <span className="hidden sm:inline">Claim your outboard</span>
          <ArrowRightIcon weight="bold" />
        </Button>
      </div>
    </form>
  );
}
