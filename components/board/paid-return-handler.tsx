"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { confirmPaidBid } from "@/lib/actions/confirm-paid-bid";
import { ConfettiBurst } from "@/components/confetti-burst";

function PaidReturnInner({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const [notice, setNotice] = useState<"ok" | "pending" | "error" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentId = query.get("payment_id")?.trim() ?? "";
  const paid = query.get("paid");
  const status = query.get("status");
  const looksPaid =
    Boolean(paymentId) &&
    (status === "succeeded" || paid === "1" || paid === "true");
  const shouldClean = Boolean(paymentId) || paid === "1";

  useEffect(() => {
    if (!shouldClean) {
      return;
    }

    let cancelled = false;

    async function run() {
      if (looksPaid && paymentId) {
        const result = await confirmPaidBid(slug, paymentId);
        if (cancelled) {
          return;
        }
        if (result.ok) {
          setNotice("ok");
          router.refresh();
        } else {
          setNotice("error");
          setError("error" in result ? result.error : null);
        }
      } else if (paid === "1" && !paymentId) {
        setNotice("pending");
      }

      router.replace(pathname || "/", { scroll: false });
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [looksPaid, paid, pathname, paymentId, router, shouldClean, slug]);

  return (
    <>
      <ConfettiBurst active={notice === "ok"} />
      {notice === "ok" ? (
        <p className="text-center text-sm text-ob-ink">
          Payment confirmed. Your listing is on the board.
        </p>
      ) : null}
      {notice === "pending" ? (
        <p className="text-center text-sm text-ob-mute">
          Payment received. If your listing is not up yet, refresh in a
          moment.
        </p>
      ) : null}
      {notice === "error" ? (
        <p className="text-center text-sm text-destructive">
          Could not confirm payment
          {error ? `: ${error}` : "."} If you were charged, refresh shortly or
          contact the board owner.
        </p>
      ) : null}
    </>
  );
}

export function PaidReturnHandler({ slug }: { slug: string }) {
  return (
    <Suspense fallback={null}>
      <PaidReturnInner slug={slug} />
    </Suspense>
  );
}
