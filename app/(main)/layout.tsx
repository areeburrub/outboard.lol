import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";

import { AppShell } from "@/components/app/app-shell";

const getCachedUser = cache(async () => currentUser());

function displayName(user: Awaited<ReturnType<typeof currentUser>>) {
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  return (
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username?.trim() ||
    (email.includes("@") ? email.slice(0, email.indexOf("@")) : "") ||
    "Account"
  );
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  await auth.protect();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getCachedUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <AppShell
      user={{
        name: displayName(user),
        email,
        imageUrl: user?.imageUrl,
      }}
    >
      {children}
    </AppShell>
  );
}
