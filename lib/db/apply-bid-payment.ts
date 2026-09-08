import { getBidByDodoPaymentId, insertBid } from "@/lib/db/bids";
import { getBoardById, incrementBoardTotalBids } from "@/lib/db/boards";
import { upsertListingOnBid } from "@/lib/db/listings";
import { boards, type ListingKind } from "@/lib/db/schema";
import { operatorDodoClient } from "@/lib/dodo";
import { fetchListingMeta } from "@/lib/listing-meta";
import { revalidatePublicBoard } from "@/lib/cache/public-board";

export type ApplyBidPaymentInput = {
  boardId: string;
  paymentId: string;
  listingKey: string;
  displayUrl: string;
  kind: ListingKind;
  chargeCents: number;
  newTotalCents: number;
  bidderEmail?: string | null;
};

export type ApplyBidPaymentResult =
  | { ok: true; created: boolean }
  | { ok: false; error: string };

export async function applySuccessfulBidPayment(
  input: ApplyBidPaymentInput,
): Promise<ApplyBidPaymentResult> {
  const existing = await getBidByDodoPaymentId(input.paymentId);
  if (existing) {
    return { ok: true, created: false };
  }

  if (
    !input.listingKey ||
    !input.displayUrl ||
    !input.chargeCents ||
    !input.newTotalCents
  ) {
    return { ok: false, error: "Missing bid metadata" };
  }

  const meta = await fetchListingMeta({
    kind: input.kind,
    displayUrl: input.displayUrl,
    canonicalKey: input.listingKey,
  }).catch(() => null);

  const listing = await upsertListingOnBid({
    boardId: input.boardId,
    canonicalKey: input.listingKey,
    displayUrl: input.displayUrl,
    kind: input.kind,
    newTotalCents: input.newTotalCents,
    meta,
  });

  if (!listing) {
    return { ok: false, error: "Listing upsert failed" };
  }

  const bid = await insertBid({
    boardId: input.boardId,
    listingId: listing.id,
    amountCents: input.chargeCents,
    newTotalCents: input.newTotalCents,
    dodoPaymentId: input.paymentId,
    bidderEmail: input.bidderEmail ?? null,
  });

  if (bid) {
    await incrementBoardTotalBids(input.boardId, input.chargeCents);
    const board = await getBoardById(input.boardId);
    if (board) {
      revalidatePublicBoard(board.slug);
    }
    return { ok: true, created: true };
  }

  // Race: another request inserted the same payment_id
  return { ok: true, created: false };
}

type BoardRow = typeof boards.$inferSelect;

/**
 * Confirm a bid via Dodo retrieve when the return URL has payment_id
 * (webhook may be delayed or missing). Idempotent on payment_id.
 */
export async function reconcileBidFromPaymentId(input: {
  board: BoardRow;
  paymentId: string;
}): Promise<ApplyBidPaymentResult> {
  const { board, paymentId } = input;

  const existing = await getBidByDodoPaymentId(paymentId);
  if (existing) {
    if (existing.boardId !== board.id) {
      return { ok: false, error: "Payment belongs to another board" };
    }
    return { ok: true, created: false };
  }

  if (!board.dodoApiKeyEncrypted) {
    return { ok: false, error: "Board has no payment account" };
  }

  try {
    const client = operatorDodoClient(board.dodoApiKeyEncrypted);
    const payment = await client.payments.retrieve(paymentId);

    if (payment.status !== "succeeded") {
      return {
        ok: false,
        error: `Payment status is ${payment.status ?? "unknown"}`,
      };
    }

    const meta = (payment.metadata ?? {}) as Record<string, string>;
    if (meta.purpose && meta.purpose !== "bid") {
      return { ok: false, error: "Not a bid payment" };
    }
    if (meta.boardId && meta.boardId !== board.id) {
      return { ok: false, error: "Board mismatch" };
    }

    const listingKey = meta.listingKey;
    const displayUrl = meta.displayUrl;
    const kind = (meta.kind === "handle" ? "handle" : "url") as ListingKind;
    const chargeCents = Number(meta.chargeCents || payment.total_amount || 0);
    const newTotalCents = Number(meta.newTotalCents || chargeCents);
    const bidderEmail = payment.customer?.email ?? null;

    return applySuccessfulBidPayment({
      boardId: board.id,
      paymentId,
      listingKey,
      displayUrl,
      kind,
      chargeCents,
      newTotalCents,
      bidderEmail,
    });
  } catch (error) {
    console.error("reconcileBidFromPaymentId", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not verify payment with Dodo",
    };
  }
}
