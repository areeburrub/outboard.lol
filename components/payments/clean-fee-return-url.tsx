"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Strip checkout return query params after reconcile. */
export function CleanFeeReturnUrl({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!active) {
      return;
    }
    router.replace(pathname || "/payments", { scroll: false });
  }, [active, pathname, router]);

  return null;
}
