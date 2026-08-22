import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { afterAuthPath, parseClaimSlug } from "@/lib/auth-redirect";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { userId } = await auth();
  const { slug: rawSlug } = await searchParams;
  const slug = parseClaimSlug(rawSlug);

  if (userId) {
    redirect(afterAuthPath(slug));
  }

  return (
    <AuthShell mode="sign-in" slug={slug}>
      <SignInForm slug={slug} />
    </AuthShell>
  );
}
