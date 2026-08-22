"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { encryptSecret } from "@/lib/crypto";
import {
  getBoardByOwnerId,
  isDodoConnected,
  updateBoardDodoConnection,
} from "@/lib/db/boards";
import { ensureOperator } from "@/lib/db/operator";
import { dodoClientFromApiKey } from "@/lib/dodo";
import { operatorWebhookUrl } from "@/lib/tenant";

export type ConnectDodoResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireBoard() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Unauthorized");
  }
  const { board } = await ensureOperator({ clerkUser });
  return board;
}

/** Paste API key only — we create the PWYW product, webhook, and store secrets. */
export async function connectDodo(apiKey: string): Promise<ConnectDodoResult> {
  const key = apiKey.trim();
  if (!key) {
    return { ok: false, error: "Paste your Dodo API key." };
  }

  try {
    const board = await requireBoard();
    const client = dodoClientFromApiKey(key);

    await client.products.list({ page_size: 1 });

    const product = await client.products.create({
      name: `Outboard bids · ${board.slug}`,
      description: `Pay-to-rank bids for ${board.slug}.outboard.lol`,
      tax_category: "digital_products",
      price: {
        type: "one_time_price",
        currency: "USD",
        price: 100,
        discount: 0,
        purchasing_power_parity: false,
        pay_what_you_want: true,
        suggested_price: 500,
      },
    });

    const webhookUrl = operatorWebhookUrl(board.id);
    const webhook = await client.webhooks.create({
      url: webhookUrl,
      description: `Outboard bids for ${board.slug}`,
      filter_types: ["payment.succeeded"],
    });

    const secretRes = await client.webhooks.retrieveSecret(webhook.id);
    const signingKey = secretRes.secret;

    if (!signingKey) {
      return {
        ok: false,
        error: "Created product but could not read webhook signing secret.",
      };
    }

    await updateBoardDodoConnection({
      boardId: board.id,
      mode: "auto",
      apiKeyEncrypted: encryptSecret(key),
      webhookSecretEncrypted: encryptSecret(signingKey),
      productId: product.product_id,
      webhookId: webhook.id,
      keyLast4: key.trim().slice(-4),
    });

    revalidatePath("/payments");
    revalidatePath("/overview");
    return { ok: true };
  } catch (error) {
    console.error("connectDodo", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not connect Dodo. Check your API key.",
    };
  }
}

export async function getDodoConnectionStatus() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const board = await getBoardByOwnerId(userId);
  if (!board) {
    return null;
  }
  return {
    connected: isDodoConnected(board),
    keyLast4: board.dodoKeyLast4,
    productId: board.dodoProductId,
    webhookUrl: operatorWebhookUrl(board.id),
    connectedAt: board.dodoConnectedAt?.toISOString() ?? null,
    platformFeeStatus: board.platformFeeStatus,
    totalBidsCents: board.totalBidsCents,
    slug: board.slug,
    boardId: board.id,
  };
}
