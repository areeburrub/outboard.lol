import {
  getPlatformFeeByDodoPaymentId,
  insertPlatformFeePayment,
} from "@/lib/db/bids";
import { getBoardById, setPlatformFeeStatus } from "@/lib/db/boards";
import { platformDodoClient } from "@/lib/dodo";
import { PLATFORM_FEE_CENTS } from "@/lib/money";
import { revalidatePublicBoard } from "@/lib/cache/public-board";

export type ApplyPlatformFeeResult =
  | { ok: true; created: boolean }
  | { ok: false; error: string };

export async function applySuccessfulPlatformFee(input: {
  boardId: string;
  paymentId: string;
  amountCents?: number;
}): Promise<ApplyPlatformFeeResult> {
  const existing = await getPlatformFeeByDodoPaymentId(input.paymentId);
  if (existing) {
    if (existing.boardId !== input.boardId) {
      return { ok: false, error: "Payment belongs to another board" };
    }
    // Ensure status is paid even if insert raced earlier
    const board = await getBoardById(input.boardId);
    if (board && board.platformFeeStatus !== "paid") {
      await setPlatformFeeStatus(input.boardId, "paid");
      revalidatePublicBoard(board.slug);
    }
    return { ok: true, created: false };
  }

  const inserted = await insertPlatformFeePayment({
    boardId: input.boardId,
    amountCents: input.amountCents ?? PLATFORM_FEE_CENTS,
    dodoPaymentId: input.paymentId,
  });

  if (inserted) {
    await setPlatformFeeStatus(input.boardId, "paid");
    const board = await getBoardById(input.boardId);
    if (board) {
      revalidatePublicBoard(board.slug);
    }
    return { ok: true, created: true };
  }

  // Race on unique payment id
  await setPlatformFeeStatus(input.boardId, "paid");
  const board = await getBoardById(input.boardId);
  if (board) {
    revalidatePublicBoard(board.slug);
  }
  return { ok: true, created: false };
}

/**
 * Confirm platform fee via Dodo retrieve when return URL has payment_id
 * (webhook may be delayed or missing). Idempotent on payment_id.
 */
export async function reconcilePlatformFeeFromPaymentId(input: {
  boardId: string;
  paymentId: string;
}): Promise<ApplyPlatformFeeResult> {
  const existing = await getPlatformFeeByDodoPaymentId(input.paymentId);
  if (existing) {
    if (existing.boardId !== input.boardId) {
      return { ok: false, error: "Payment belongs to another board" };
    }
    const board = await getBoardById(input.boardId);
    if (board && board.platformFeeStatus !== "paid") {
      await setPlatformFeeStatus(input.boardId, "paid");
    }
    return { ok: true, created: false };
  }

  try {
    const client = platformDodoClient();
    const payment = await client.payments.retrieve(input.paymentId);

    if (payment.status !== "succeeded") {
      return {
        ok: false,
        error: `Payment status is ${payment.status ?? "unknown"}`,
      };
    }

    const meta = (payment.metadata ?? {}) as Record<string, string>;
    if (meta.purpose && meta.purpose !== "platform_fee") {
      return { ok: false, error: "Not a platform fee payment" };
    }
    if (meta.boardId && meta.boardId !== input.boardId) {
      return { ok: false, error: "Board mismatch" };
    }

    return applySuccessfulPlatformFee({
      boardId: input.boardId,
      paymentId: input.paymentId,
      amountCents: payment.total_amount ?? PLATFORM_FEE_CENTS,
    });
  } catch (error) {
    console.error("reconcilePlatformFeeFromPaymentId", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not verify payment with Dodo",
    };
  }
}
