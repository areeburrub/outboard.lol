import { createHmac, timingSafeEqual } from "node:crypto";

import { Webhook } from "standardwebhooks";
import { NextResponse } from "next/server";

import { decryptSecret } from "@/lib/crypto";
import { applySuccessfulBidPayment } from "@/lib/db/apply-bid-payment";
import { getBoardById } from "@/lib/db/boards";
import type { ListingKind } from "@/lib/db/schema";

function verifyHmacHex(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
) {
  if (!signatureHeader) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signatureHeader.includes("=")
    ? signatureHeader.split(",").find((p) => p.trim().startsWith("v1="))?.slice(3) ||
      signatureHeader
    : signatureHeader;

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(provided.trim());
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifyWebhook(
  rawBody: string,
  headers: Headers,
  secret: string,
): boolean {
  try {
    const wh = new Webhook(secret);
    wh.verify(rawBody, {
      "webhook-id": headers.get("webhook-id") || "",
      "webhook-signature": headers.get("webhook-signature") || "",
      "webhook-timestamp": headers.get("webhook-timestamp") || "",
    });
    return true;
  } catch {
    return verifyHmacHex(
      rawBody,
      headers.get("webhook-signature") || headers.get("Webhook-Signature"),
      secret,
    );
  }
}

type PaymentPayload = {
  type?: string;
  data?: {
    payment_id?: string;
    total_amount?: number;
    customer?: { email?: string };
    metadata?: Record<string, string>;
  };
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const { boardId } = await params;
  const board = await getBoardById(boardId);
  if (!board?.dodoWebhookSecretEncrypted) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  const rawBody = await req.text();
  const secret = decryptSecret(board.dodoWebhookSecretEncrypted);

  if (!verifyWebhook(rawBody, req.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaymentPayload;
  try {
    event = JSON.parse(rawBody) as PaymentPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type !== "payment.succeeded") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const data = event.data;
  const paymentId = data?.payment_id;
  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
  }

  const meta = data.metadata ?? {};
  if (meta.boardId && meta.boardId !== boardId) {
    return NextResponse.json({ error: "Board mismatch" }, { status: 400 });
  }

  const result = await applySuccessfulBidPayment({
    boardId,
    paymentId,
    listingKey: meta.listingKey ?? "",
    displayUrl: meta.displayUrl ?? "",
    kind: (meta.kind === "handle" ? "handle" : "url") as ListingKind,
    chargeCents: Number(meta.chargeCents || data.total_amount || 0),
    newTotalCents: Number(
      meta.newTotalCents || meta.chargeCents || data.total_amount || 0,
    ),
    bidderEmail: data.customer?.email ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    duplicate: !result.created,
  });
}
