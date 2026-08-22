import { NextResponse } from "next/server";

import { insertClick } from "@/lib/db/bids";
import { getBoardBySlug } from "@/lib/db/boards";
import {
  getListingById,
  incrementListingClicks,
} from "@/lib/db/listings";
import { normalizeSlug } from "@/lib/slug";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug: raw, id } = await params;
  const slug = normalizeSlug(raw);
  const board = await getBoardBySlug(slug);
  if (!board) {
    return new NextResponse("Not found", { status: 404 });
  }

  const listing = await getListingById(board.id, id);
  if (!listing || listing.status !== "live") {
    return new NextResponse("Not found", { status: 404 });
  }

  await insertClick({ boardId: board.id, listingId: listing.id });
  await incrementListingClicks(board.id, listing.id);

  return NextResponse.redirect(listing.displayUrl, 302);
}
