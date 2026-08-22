"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { saveBoardSettings } from "@/lib/actions/board-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { BoardLink } from "@/lib/db/schema";

type LinkDraft = BoardLink;

export function BoardSettingsForm({
  name,
  minBidDollars,
  rules,
  links,
}: {
  name: string;
  minBidDollars: number;
  rules: string;
  links: BoardLink[];
}) {
  const router = useRouter();
  const [pageName, setPageName] = useState(name);
  const [minBid, setMinBid] = useState(minBidDollars);
  const [rulesText, setRulesText] = useState(rules);
  const [linkRows, setLinkRows] = useState<LinkDraft[]>(
    links.length > 0 ? links : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPageName(name);
    setMinBid(minBidDollars);
    setRulesText(rules);
    setLinkRows(links.length > 0 ? links : []);
  }, [name, minBidDollars, rules, links]);

  function setLink(index: number, patch: Partial<LinkDraft>) {
    setLinkRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const result = await saveBoardSettings({
      name: pageName,
      minBidDollars: minBid,
      rules: rulesText,
      links: linkRows,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-8">
      <div className="space-y-2">
        <Label htmlFor="page-name">Page name</Label>
        <Input
          id="page-name"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          maxLength={60}
          required
          disabled={loading}
        />
        <p className="text-xs text-ob-mute">
          Shown in the public board nav.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="min-bid">Minimum bid (USD)</Label>
        <Input
          id="min-bid"
          type="number"
          inputMode="numeric"
          min={1}
          max={999999}
          step={1}
          value={minBid}
          onChange={(e) => setMinBid(Number(e.target.value) || 1)}
          required
          disabled={loading}
          className="max-w-[10rem] font-mono"
        />
        <p className="text-xs text-ob-mute">
          New listings cannot bid below this. Default is $5.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label>Links</Label>
            <p className="mt-1 text-xs text-ob-mute">
              Optional. Appear in the public board nav.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || linkRows.length >= 8}
            onClick={() =>
              setLinkRows((rows) => [...rows, { label: "", url: "" }])
            }
            className="h-8 gap-1.5 rounded-full"
          >
            <PlusIcon weight="bold" className="size-3.5" />
            Add link
          </Button>
        </div>
        {linkRows.length === 0 ? (
          <p className="rounded-[1rem] border border-dashed border-ob-line px-4 py-5 text-sm text-ob-mute">
            No links yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {linkRows.map((row, index) => (
              <li
                key={index}
                className="grid gap-2 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)_auto]"
              >
                <Input
                  value={row.label}
                  onChange={(e) => setLink(index, { label: e.target.value })}
                  placeholder="About"
                  disabled={loading}
                  aria-label={`Link ${index + 1} label`}
                />
                <Input
                  value={row.url}
                  onChange={(e) => setLink(index, { url: e.target.value })}
                  placeholder="https://…"
                  disabled={loading}
                  aria-label={`Link ${index + 1} URL`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label={`Remove link ${index + 1}`}
                  disabled={loading}
                  onClick={() =>
                    setLinkRows((rows) => rows.filter((_, i) => i !== index))
                  }
                  className="text-ob-mute hover:text-ob-ink"
                >
                  <TrashIcon weight="bold" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules">Rules</Label>
        <textarea
          id="rules"
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          maxLength={2000}
          rows={6}
          disabled={loading}
          placeholder="Rank is bid size. Higher bid = higher row. Whole dollars only."
          className="min-h-32 w-full resize-y rounded-[1rem] border border-ob-line bg-ob-surface px-4 py-3 text-base text-ob-ink outline-none placeholder:text-ob-mute/70 focus-visible:border-ob-win focus-visible:ring-2 focus-visible:ring-ob-win/30 disabled:opacity-50"
        />
        <p className="text-xs text-ob-mute">
          Optional. Linked from the nav if you write any.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? (
        <p className="text-sm text-ob-win">Saved. The public board is updated.</p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="h-12 w-full gap-2 rounded-full text-sm font-semibold sm:w-auto"
      >
        {loading ? <Spinner /> : null}
        {loading ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
