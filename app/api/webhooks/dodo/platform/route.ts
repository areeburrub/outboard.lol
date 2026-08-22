import { Webhooks } from "@dodopayments/nextjs";

import { applySuccessfulPlatformFee } from "@/lib/db/apply-platform-fee";
import { getPlatformFeeByDodoPaymentId } from "@/lib/db/bids";
import { PLATFORM_FEE_CENTS } from "@/lib/money";

function createHandler() {
  const webhookKey = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookKey) {
    return async () =>
      Response.json(
        { error: "Platform webhook is not configured" },
        { status: 503 },
      );
  }

  return Webhooks({
    webhookKey,
    onPaymentSucceeded: async (payload) => {
      const data = payload.data as {
        payment_id?: string;
        metadata?: Record<string, string>;
        total_amount?: number;
      };

      const paymentId = data.payment_id;
      if (!paymentId) {
        return;
      }

      const existing = await getPlatformFeeByDodoPaymentId(paymentId);
      if (existing) {
        return;
      }

      const boardId = data.metadata?.boardId;
      const purpose = data.metadata?.purpose;
      if (!boardId || purpose !== "platform_fee") {
        return;
      }

      await applySuccessfulPlatformFee({
        boardId,
        paymentId,
        amountCents: data.total_amount ?? PLATFORM_FEE_CENTS,
      });
    },
  });
}

export const POST = createHandler();
