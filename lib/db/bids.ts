import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/lib/db";
import { bids, clicks, platformFeePayments } from "@/lib/db/schema";

export async function getBidByDodoPaymentId(dodoPaymentId: string) {
  return db.query.bids.findFirst({
    where: eq(bids.dodoPaymentId, dodoPaymentId),
  });
}

export async function insertBid(input: {
  boardId: string;
  listingId: string;
  amountCents: number;
  newTotalCents: number;
  dodoPaymentId: string;
  bidderEmail?: string | null;
}) {
  const [bid] = await db
    .insert(bids)
    .values({
      id: nanoid(),
      boardId: input.boardId,
      listingId: input.listingId,
      amountCents: input.amountCents,
      newTotalCents: input.newTotalCents,
      dodoPaymentId: input.dodoPaymentId,
      bidderEmail: input.bidderEmail ?? null,
      status: "succeeded",
    })
    .onConflictDoNothing({ target: bids.dodoPaymentId })
    .returning();

  return bid ?? null;
}

export async function listBidsForBoard(boardId: string, limit = 50) {
  return db.query.bids.findMany({
    where: eq(bids.boardId, boardId),
    orderBy: [desc(bids.createdAt)],
    limit,
    with: {
      listing: true,
    },
  });
}

export async function insertClick(input: {
  boardId: string;
  listingId: string;
}) {
  const [click] = await db
    .insert(clicks)
    .values({
      id: nanoid(),
      boardId: input.boardId,
      listingId: input.listingId,
    })
    .returning();

  return click;
}

export async function getPlatformFeeByDodoPaymentId(dodoPaymentId: string) {
  return db.query.platformFeePayments.findFirst({
    where: eq(platformFeePayments.dodoPaymentId, dodoPaymentId),
  });
}

export async function insertPlatformFeePayment(input: {
  boardId: string;
  amountCents: number;
  dodoPaymentId: string;
}) {
  const [row] = await db
    .insert(platformFeePayments)
    .values({
      id: nanoid(),
      boardId: input.boardId,
      amountCents: input.amountCents,
      dodoPaymentId: input.dodoPaymentId,
    })
    .onConflictDoNothing({ target: platformFeePayments.dodoPaymentId })
    .returning();

  return row ?? null;
}

export async function listPlatformFeePayments(boardId: string) {
  return db.query.platformFeePayments.findMany({
    where: eq(platformFeePayments.boardId, boardId),
    orderBy: [desc(platformFeePayments.paidAt)],
  });
}
