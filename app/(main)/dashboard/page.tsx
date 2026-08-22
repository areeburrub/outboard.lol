import { redirect } from "next/navigation";

import { afterAuthPath, parseClaimSlug } from "@/lib/auth-redirect";

export default async function DashboardRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  redirect(afterAuthPath(parseClaimSlug(slug)));
}
