"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { startPlatformFeeCheckout } from "@/lib/actions/platform-fee";
import { formatUsdFromCents, PLATFORM_FEE_CENTS } from "@/lib/money";

export function PlatformFeePayButton({
  mode,
}: {
  mode: "prepay" | "due";
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        className={
          mode === "due"
            ? "h-12 rounded-full bg-ob-win px-8 text-sm font-semibold text-ob-win-ink"
            : "h-12 rounded-full px-8 text-sm font-semibold"
        }
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await startPlatformFeeCheckout();
            if (!result.ok) {
              setError(result.error);
              return;
            }
            window.location.href = result.checkoutUrl;
          });
        }}
      >
        {pending ? <Spinner /> : null}
        {pending
          ? "Redirecting…"
          : mode === "due"
            ? `Pay ${formatUsdFromCents(PLATFORM_FEE_CENTS)} to unpause`
            : `Prepay ${formatUsdFromCents(PLATFORM_FEE_CENTS)}`}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
