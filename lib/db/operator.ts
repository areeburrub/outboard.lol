import type { User } from "@clerk/nextjs/server";

import { ensureBoardForOwner, getBoardByOwnerId } from "@/lib/db/boards";
import { ensureUserSynced, upsertUser } from "@/lib/db/users";
import { normalizeSlug, slugError } from "@/lib/slug";

function primaryEmail(user: User) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function ensureOperator(input: {
  clerkUser: User;
  claimSlug?: string | null;
}) {
  const { clerkUser, claimSlug } = input;
  const email = primaryEmail(clerkUser);
  if (!email) {
    throw new Error("Account has no email address");
  }

  const user = await upsertUser({
    id: clerkUser.id,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    username: clerkUser.username,
  });

  const existing = await getBoardByOwnerId(clerkUser.id);
  if (existing) {
    return { user, board: existing };
  }

  const rawSlug = claimSlug || clerkUser.username || "";
  const slug = normalizeSlug(rawSlug);
  const error = slugError(slug);
  if (error) {
    throw new Error(error);
  }

  const board = await ensureBoardForOwner({
    ownerId: clerkUser.id,
    slug,
    name: slug,
  });

  return { user, board };
}

export async function syncOperatorFromClerk(clerkUser: User) {
  const email = primaryEmail(clerkUser);
  if (!email) {
    return null;
  }

  return ensureUserSynced({
    id: clerkUser.id,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    username: clerkUser.username,
  });
}
