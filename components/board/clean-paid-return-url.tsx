"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Strip checkout return query params after reconcile so refresh is clean. */
export function CleanPaidReturnUrl({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!active) {
      return;
    }
    router.replace(pathname || "/", { scroll: false });
  }, [active, pathname, router]);

  return null;
}
