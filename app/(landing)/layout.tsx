import type { ReactNode } from "react";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ob-wash relative flex min-w-0 flex-1 flex-col overflow-x-clip">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
