"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeSlug } from "@/lib/slug";

type SlugFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  hint?: string | null;
};

export function SlugField({
  id = "username",
  value,
  onChange,
  disabled,
  invalid,
  hint,
}: SlugFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Board name</Label>
      <div
        className={`flex h-12 items-center overflow-hidden rounded-[1rem] border bg-ob-surface px-4 transition-colors ${
          invalid
            ? "border-destructive ring-1 ring-destructive/20"
            : "border-ob-line focus-within:border-ob-win focus-within:ring-2 focus-within:ring-ob-win/30"
        }`}
      >
        <Input
          id={id}
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          placeholder="your-board"
          value={value}
          onChange={(event) => onChange(sanitizeSlug(event.target.value))}
          disabled={disabled}
          required
          aria-invalid={invalid || undefined}
          className="h-auto rounded-none border-0 bg-transparent px-0 font-mono shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
        <span className="ml-1.5 hidden shrink-0 font-mono text-sm text-ob-mute sm:inline">
          .outboard.lol
        </span>
      </div>
      <p className="font-mono text-xs text-ob-mute sm:hidden">
        {value || "your-board"}.outboard.lol
      </p>
      {hint ? (
        <p className={invalid ? "text-sm text-destructive" : "text-sm text-ob-mute"}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
