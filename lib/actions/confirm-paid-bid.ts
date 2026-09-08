"use server";

import { reconcileBidFromPaymentId } from "@/lib/db/apply-bid-payment";
import { getBoardBySlug } from "@/lib/db/boards";
import { revalidatePublicBoard } from "@/lib/cache/public-board";
import { normalizeSlug } from "@/lib/slug";

export async function confirmPaidBid(rawSlug: string, paymentId: string) {
  const slug = normalizeSlug(rawSlug);
  const board = await getBoardBySlug(slug);
  if (!board) {
    return { ok: false as const, error: "Board not found" };
  }

  const result = await reconcileBidFromPaymentId({ board, paymentId });
  if (result.ok) {
    revalidatePublicBoard(slug);
  }
  return result;
}
