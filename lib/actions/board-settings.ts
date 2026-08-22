"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateBoardSettings } from "@/lib/db/boards";
import { ensureOperator } from "@/lib/db/operator";

function normalizeHttpUrl(raw: string) {
  const value = raw.trim();
  if (!value) {
    return value;
  }
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const linkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: z
    .string()
    .trim()
    .max(300)
    .transform(normalizeHttpUrl)
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid link URL."),
});

const settingsSchema = z.object({
  name: z.string().trim().min(1, "Enter a page name.").max(60),
  minBidDollars: z
    .number()
    .int()
    .min(1, "Minimum bid is $1.")
    .max(999_999),
  rules: z.string().trim().max(2000).optional(),
  links: z.array(linkSchema).max(8),
});

export type SaveBoardSettingsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveBoardSettings(input: {
  name: string;
  minBidDollars: number;
  rules: string;
  links: { label: string; url: string }[];
}): Promise<SaveBoardSettingsResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { ok: false, error: "Unauthorized" };
  }

  const links = input.links.filter(
    (link) => link.label.trim() || link.url.trim(),
  );

  const parsed = settingsSchema.safeParse({
    name: input.name,
    minBidDollars: input.minBidDollars,
    rules: input.rules,
    links,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Invalid settings." };
  }

  try {
    const { board } = await ensureOperator({ clerkUser });
    const rules = parsed.data.rules?.trim() || null;

    await updateBoardSettings({
      boardId: board.id,
      name: parsed.data.name,
      minBidCents: parsed.data.minBidDollars * 100,
      rules,
      links: parsed.data.links.map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
      })),
    });

    revalidatePath("/settings");
    revalidatePath("/overview");
    revalidatePath(`/b/${board.slug}`);
    revalidatePath(`/b/${board.slug}`, "layout");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save settings.",
    };
  }
}
