"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { afterAuthPath, readClaimSlug } from "@/lib/auth-redirect";

export default function SSOCallbackPage() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!clerk.loaded || hasRun.current || !signIn || !signUp) {
      return;
    }

    hasRun.current = true;
    const destination = afterAuthPath(readClaimSlug());

    const go = (url: string) => {
      if (url.startsWith("http")) {
        window.location.href = url;
        return;
      }
      router.replace(url);
    };

    const finalizeSignIn = async () => {
      const { error } = await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            return;
          }
          go(decorateUrl(destination));
        },
      });
      if (error) {
        setFailed(true);
      }
    };

    const finalizeSignUp = async () => {
      const { error } = await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            return;
          }
          go(decorateUrl(destination));
        },
      });
      if (error) {
        setFailed(true);
      }
    };

    void (async () => {
      try {
        if (signIn.status === "complete") {
          await finalizeSignIn();
          return;
        }

        if (signUp.isTransferable) {
          await signIn.create({ transfer: true });
          const signInStatus = signIn.status as typeof signIn.status | "complete";
          if (signInStatus === "complete") {
            await finalizeSignIn();
            return;
          }
          router.replace("/sign-in");
          return;
        }

        if (signIn.isTransferable) {
          await signUp.create({ transfer: true });
          const signUpStatus = signUp.status as typeof signUp.status | "complete";
          if (signUpStatus === "complete") {
            await finalizeSignUp();
            return;
          }
          router.replace("/sign-up");
          return;
        }

        if (signUp.status === "complete") {
          await finalizeSignUp();
          return;
        }

        if (
          signUp.status === "missing_requirements" ||
          (signUp.id && signUp.missingFields.length > 0)
        ) {
          router.replace("/sign-up");
          return;
        }

        if (
          signIn.status === "needs_second_factor" ||
          signIn.status === "needs_new_password" ||
          signIn.status === "needs_first_factor"
        ) {
          router.replace("/sign-in");
          return;
        }

        if (signIn.existingSession || signUp.existingSession) {
          const sessionId =
            signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;
          if (sessionId) {
            await clerk.setActive({
              session: sessionId,
              navigate: ({ session, decorateUrl }) => {
                if (session?.currentTask) {
                  return;
                }
                go(decorateUrl(destination));
              },
            });
            return;
          }
        }

        setFailed(true);
      } catch {
        setFailed(true);
      }
    })();
  }, [clerk, router, signIn, signUp]);

  return (
    <div className="ob-wash flex min-h-dvh flex-col items-center justify-center gap-3">
      {failed ? (
        <>
          <p className="text-sm text-ob-mute">Could not finish sign in.</p>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-ob-win hover:underline"
          >
            Back to sign in
          </Link>
        </>
      ) : (
        <>
          <Spinner className="size-6" />
          <p className="text-sm text-ob-mute">Finishing sign in…</p>
        </>
      )}
    </div>
  );
}
