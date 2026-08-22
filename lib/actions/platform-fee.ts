"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { ensureOperator } from "@/lib/db/operator";
import { platformDodoClient } from "@/lib/dodo";
import { PLATFORM_FEE_CENTS } from "@/lib/money";
import { apexUrl } from "@/lib/tenant";

export async function startPlatformFeeCheckout(): Promise<
  { ok: true; checkoutUrl: string } | { ok: false; error: string }
> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }

  const productId = process.env.DODO_PLATFORM_PRODUCT_ID;
  if (!productId || !process.env.DODO_PAYMENTS_API_KEY) {
    return {
      ok: false,
      error: "Platform payments are not configured yet.",
    };
  }

  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { ok: false, error: "Unauthorized" };
    }
    const { board } = await ensureOperator({ clerkUser });

    if (board.platformFeeStatus === "paid") {
      return { ok: false, error: "Platform fee is already paid." };
    }

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null;
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      undefined;

    // Allow prepay (`none`) or pay when due — both unlock the board forever after.
    const client = platformDodoClient();
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
          amount: PLATFORM_FEE_CENTS,
        },
      ],
      return_url: apexUrl("/payments?fee=paid"),
      ...(email
        ? {
            customer: {
              email,
              ...(name ? { name } : {}),
            },
          }
        : {}),
      metadata: {
        boardId: board.id,
        purpose: "platform_fee",
        mode: board.platformFeeStatus === "none" ? "prepay" : "due",
        ...(userId ? { userId } : {}),
      },
    });

    if (!session.checkout_url) {
      return { ok: false, error: "Missing checkout URL." };
    }

    return { ok: true, checkoutUrl: session.checkout_url };
  } catch (error) {
    console.error("startPlatformFeeCheckout", error);
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not start checkout.",
    };
  }
}
