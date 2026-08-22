import { NextResponse } from "next/server";
import { z } from "zod";

import { boardMinBidCents, getBoardBySlug, isDodoConnected } from "@/lib/db/boards";
import { getListingByCanonical, listLiveRankings } from "@/lib/db/listings";
import { operatorDodoClient } from "@/lib/dodo";
import { parseListingInput } from "@/lib/listing-input";
import {
  MIN_REBID_DELTA_CENTS,
  MIN_TAKE_FIRST_DELTA_CENTS,
  wholeDollarsToCents,
} from "@/lib/money";
import { normalizeSlug } from "@/lib/slug";
import { publicBoardUrl } from "@/lib/tenant";

const bodySchema = z.object({
  listing: z.string().min(1),
  amountDollars: z.number().int().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: raw } = await params;
  const slug = normalizeSlug(raw);
  const board = await getBoardBySlug(slug);

  if (!board) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (!isDodoConnected(board) || !board.dodoApiKeyEncrypted || !board.dodoProductId) {
    return NextResponse.json(
      { error: "This board is not accepting bids yet." },
      { status: 400 },
    );
  }

  if (board.platformFeeStatus === "due") {
    return NextResponse.json(
      { error: "Bidding is paused until the platform fee is paid." },
      { status: 400 },
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseListingInput(body.listing);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  let amountCents: number;
  try {
    amountCents = wholeDollarsToCents(body.amountDollars);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid amount." },
      { status: 400 },
    );
  }

  const existing = await getListingByCanonical(board.id, parsed.canonicalKey);
  const rankings = await listLiveRankings(board.id);
  const topBid = rankings[0]?.totalBidCents ?? 0;

  let chargeCents = amountCents;
  let newTotalCents = amountCents;

  if (existing) {
    // Rebid: pay the difference; new total must be at least $1 above current
    const minTotal = existing.totalBidCents + MIN_REBID_DELTA_CENTS;
    if (amountCents < minTotal) {
      return NextResponse.json(
        {
          error: `Rebid must bring total to at least $${minTotal / 100}.`,
        },
        { status: 400 },
      );
    }
    newTotalCents = amountCents;
    chargeCents = amountCents - existing.totalBidCents;
    if (chargeCents < MIN_REBID_DELTA_CENTS) {
      return NextResponse.json(
        { error: "You must increase your bid by at least $1." },
        { status: 400 },
      );
    }
  } else {
    const minBidCents = boardMinBidCents(board);
    if (amountCents < minBidCents) {
      return NextResponse.json(
        { error: `New listings start at $${minBidCents / 100}.` },
        { status: 400 },
      );
    }
    // Taking #1 requires $5 more than current top (optional soft rule — still allow lower ranks)
    if (topBid > 0 && amountCents >= topBid + MIN_TAKE_FIRST_DELTA_CENTS) {
      // fine — claiming #1
    }
    newTotalCents = amountCents;
    chargeCents = amountCents;
  }

  try {
    const client = operatorDodoClient(board.dodoApiKeyEncrypted);
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: board.dodoProductId,
          quantity: 1,
          amount: chargeCents,
        },
      ],
      return_url: publicBoardUrl(slug, "/?paid=1"),
      metadata: {
        boardId: board.id,
        listingKey: parsed.canonicalKey,
        displayUrl: parsed.displayUrl,
        kind: parsed.kind,
        chargeCents: String(chargeCents),
        newTotalCents: String(newTotalCents),
        purpose: "bid",
      },
    });

    if (!session.checkout_url) {
      return NextResponse.json(
        { error: "Checkout session missing URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ checkoutUrl: session.checkout_url });
  } catch (error) {
    console.error("bid checkout", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create checkout session.",
      },
      { status: 500 },
    );
  }
}
