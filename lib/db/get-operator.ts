import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";

import { parseClaimSlug } from "@/lib/auth-redirect";
import { getBoardByOwnerId } from "@/lib/db/boards";
import { ensureOperator } from "@/lib/db/operator";
import { upsertUser } from "@/lib/db/users";
import { normalizeSlug, slugError } from "@/lib/slug";

export const getOperatorContext = cache(async (claimSlug?: string | null) => {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Account has no email address");
  }

  await upsertUser({
    id: clerkUser.id,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    username: clerkUser.username,
  });

  const existing = await getBoardByOwnerId(clerkUser.id);
  if (existing) {
    return { clerkUser, board: existing };
  }

  const rawSlug = parseClaimSlug(claimSlug) || clerkUser.username || "";
  const slug = normalizeSlug(rawSlug);
  if (slugError(slug)) {
    redirect(claimSlug ? `/sign-up?slug=${encodeURIComponent(slug)}` : "/sign-up");
  }

  const { board } = await ensureOperator({
    clerkUser,
    claimSlug: slug,
  });

  return { clerkUser, board };
});
