import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/lib/db";
import {
  boards,
  type BoardLink,
  type DodoSetupMode,
  type PlatformFeeStatus,
} from "@/lib/db/schema";
import { FEE_THRESHOLD_CENTS, MIN_BID_CENTS } from "@/lib/money";
import { normalizeSlug, slugError } from "@/lib/slug";

export async function getBoardByOwnerId(ownerId: string) {
  return db.query.boards.findFirst({
    where: eq(boards.ownerId, ownerId),
  });
}

export async function getBoardBySlug(slug: string) {
  return db.query.boards.findFirst({
    where: eq(boards.slug, normalizeSlug(slug)),
  });
}

export async function getBoardById(id: string) {
  return db.query.boards.findFirst({
    where: eq(boards.id, id),
  });
}

export async function createBoard(input: {
  ownerId: string;
  slug: string;
  name?: string;
}) {
  const slug = normalizeSlug(input.slug);
  const error = slugError(slug);
  if (error) {
    throw new Error(error);
  }

  const [board] = await db
    .insert(boards)
    .values({
      id: nanoid(),
      ownerId: input.ownerId,
      slug,
      name: input.name?.trim() || slug,
      status: "setup",
    })
    .returning();

  return board;
}

export async function ensureBoardForOwner(input: {
  ownerId: string;
  slug: string;
  name?: string;
}) {
  const existing = await getBoardByOwnerId(input.ownerId);
  if (existing) {
    return existing;
  }
  return createBoard(input);
}

export async function updateBoardDodoConnection(input: {
  boardId: string;
  mode: DodoSetupMode;
  apiKeyEncrypted: string;
  webhookSecretEncrypted: string;
  productId: string;
  webhookId?: string | null;
  keyLast4: string;
}) {
  const [board] = await db
    .update(boards)
    .set({
      dodoSetupMode: input.mode,
      dodoApiKeyEncrypted: input.apiKeyEncrypted,
      dodoWebhookSecretEncrypted: input.webhookSecretEncrypted,
      dodoProductId: input.productId,
      dodoWebhookId: input.webhookId ?? null,
      dodoKeyLast4: input.keyLast4,
      dodoConnectedAt: new Date(),
      status: "live",
      updatedAt: new Date(),
    })
    .where(eq(boards.id, input.boardId))
    .returning();

  return board;
}

export async function setPlatformFeeStatus(
  boardId: string,
  status: PlatformFeeStatus,
) {
  const [board] = await db
    .update(boards)
    .set({
      platformFeeStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(boards.id, boardId))
    .returning();

  return board;
}

export async function incrementBoardTotalBids(
  boardId: string,
  amountCents: number,
) {
  const board = await getBoardById(boardId);
  if (!board) {
    return null;
  }

  const nextTotal = board.totalBidsCents + amountCents;
  const nextFeeStatus =
    board.platformFeeStatus === "none" && nextTotal >= FEE_THRESHOLD_CENTS
      ? ("due" as const)
      : board.platformFeeStatus;

  const [updated] = await db
    .update(boards)
    .set({
      totalBidsCents: nextTotal,
      platformFeeStatus: nextFeeStatus,
      updatedAt: new Date(),
    })
    .where(eq(boards.id, boardId))
    .returning();

  return updated;
}

export async function updateBoardSettings(input: {
  boardId: string;
  name: string;
  minBidCents: number;
  rules: string | null;
  links: BoardLink[];
}) {
  const [board] = await db
    .update(boards)
    .set({
      name: input.name,
      minBidCents: input.minBidCents,
      rules: input.rules,
      links: input.links,
      updatedAt: new Date(),
    })
    .where(eq(boards.id, input.boardId))
    .returning();

  return board;
}

export function boardMinBidCents(
  board: Pick<typeof boards.$inferSelect, "minBidCents"> | null | undefined,
) {
  const value = Number(board?.minBidCents);
  if (!Number.isFinite(value) || value < 100) {
    return MIN_BID_CENTS;
  }
  return Math.round(value);
}

export function boardLinks(
  board: Pick<typeof boards.$inferSelect, "links"> | null | undefined,
): BoardLink[] {
  const raw = board?.links;
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    } catch {
      return [];
    }
  }
  return list.filter((item): item is BoardLink => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const label = "label" in item ? String(item.label ?? "").trim() : "";
    const url = "url" in item ? String(item.url ?? "").trim() : "";
    return label.length > 0 && /^https?:\/\//i.test(url);
  });
}

export function isDodoConnected(
  board: typeof boards.$inferSelect | null | undefined,
) {
  return Boolean(
    board?.dodoApiKeyEncrypted &&
      board?.dodoWebhookSecretEncrypted &&
      board?.dodoProductId &&
      board?.dodoConnectedAt,
  );
}
