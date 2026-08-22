"use client";

import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  afterAuthPath,
  authPageHref,
  persistClaimSlug,
} from "@/lib/auth-redirect";
import { firstAuthError, getClerkErrorMessage } from "@/lib/clerk-error";

import { AuthDivider } from "./auth-divider";
import { AuthFormHeading } from "./auth-form-heading";
import { EmailVerificationOtp } from "./email-verification-otp";
import { FormError } from "./form-error";
import { GoogleOAuthButton } from "./google-oauth-button";
import { PasswordField } from "./password-field";

export function SignInForm({ slug }: { slug?: string }) {
  const { signIn, errors, fetchStatus } = useSignIn();
  const afterAuth = afterAuthPath(slug);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifyMode, setVerifyMode] = useState<"first" | "mfa" | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBusy = fetchStatus === "fetching";

  useEffect(() => {
    persistClaimSlug(slug);
  }, [slug]);

  const finish = useCallback(async () => {
    if (!signIn) {
      setError("Unable to complete sign in. Please try again.");
      return;
    }

    const { error: finalizeError } = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          return;
        }

        const url = decorateUrl(afterAuth);
        window.location.href = url.startsWith("http") ? url : afterAuth;
      },
    });

    if (finalizeError) {
      setError(
        getClerkErrorMessage(
          finalizeError,
          "Unable to complete sign in. Please try again.",
        ),
      );
    }
  }, [afterAuth, signIn]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!signIn) {
      return;
    }

    const { error: passwordError } = await signIn.password({
      identifier,
      password,
    });

    if (passwordError) {
      setError(
        getClerkErrorMessage(passwordError, "Could not sign in. Please try again."),
      );
      return;
    }

    if (signIn.status === "complete") {
      await finish();
      return;
    }

    if (signIn.status === "needs_first_factor") {
      const { error: codeError } = await signIn.emailCode.sendCode();

      if (codeError) {
        setError(
          getClerkErrorMessage(
            codeError,
            "Additional verification is required. Please try again.",
          ),
        );
        return;
      }

      setVerifyMode("first");
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      const { error: mfaError } = await signIn.mfa.sendEmailCode();

      if (mfaError) {
        setError(
          getClerkErrorMessage(
            mfaError,
            "Additional verification is required. Please try again.",
          ),
        );
        return;
      }

      setVerifyMode("mfa");
      return;
    }

    setError(firstAuthError(errors, "Could not sign in. Please try again."));
  };

  const handleResendCode = async () => {
    setError(null);
    setIsResending(true);

    if (!signIn || !verifyMode) {
      setIsResending(false);
      return;
    }

    try {
      const { error: resendError } =
        verifyMode === "mfa"
          ? await signIn.mfa.sendEmailCode()
          : await signIn.emailCode.sendCode();

      if (resendError) {
        setError(
          getClerkErrorMessage(
            resendError,
            "Failed to resend code. Please try again.",
          ),
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeSubmit = async (
    event?: React.FormEvent,
    nextCode?: string,
  ) => {
    event?.preventDefault();
    const value = nextCode ?? code;

    if (value.length !== 6 || isBusy || !signIn || !verifyMode) {
      return;
    }

    setError(null);

    const { error: verifyError } =
      verifyMode === "mfa"
        ? await signIn.mfa.verifyEmailCode({ code: value })
        : await signIn.emailCode.verifyCode({ code: value });

    if (verifyError) {
      setError(getClerkErrorMessage(verifyError, "Invalid code. Please try again."));
      return;
    }

    if (signIn.status === "complete") {
      await finish();
      return;
    }

    setError("Verification failed. Please check your code and try again.");
  };

  if (verifyMode) {
    return (
      <EmailVerificationOtp
        email={identifier}
        code={code}
        onCodeChange={setCode}
        onResend={handleResendCode}
        onChangeEmail={() => {
          setVerifyMode(null);
          setCode("");
          setError(null);
        }}
        error={error}
        isLoading={isBusy}
        isResending={isResending}
        onSubmit={handleCodeSubmit}
      />
    );
  }

  return (
    <div className="w-full">
      <AuthFormHeading
        title="Welcome back"
        subtitle="Your board and Dodo key are where you left them."
      />
      <div className="mt-8 space-y-4">
        <GoogleOAuthButton
          loading={isGoogleLoading}
          disabled={!signIn || isBusy}
          onClick={async () => {
            if (!signIn || isGoogleLoading) {
              return;
            }
            setIsGoogleLoading(true);
            setError(null);
            persistClaimSlug(slug);
            try {
              const { error: oauthError } = await signIn.sso({
                strategy: "oauth_google",
                redirectUrl: afterAuth,
                redirectCallbackUrl: "/sso-callback",
              });
              if (oauthError) {
                setError(
                  getClerkErrorMessage(
                    oauthError,
                    "Failed to authenticate with Google",
                  ),
                );
                setIsGoogleLoading(false);
              }
            } catch (err: unknown) {
              setError(
                getClerkErrorMessage(err, "Failed to authenticate with Google"),
              );
              setIsGoogleLoading(false);
            }
          }}
        />
        <AuthDivider />
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or username</Label>
            <Input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="you@email.com or your-board"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                setError(null);
              }}
              required
              disabled={isBusy}
              aria-invalid={Boolean(errors.fields.identifier) || undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordField
              id="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setError(null);
              }}
              disabled={isBusy}
              invalid={Boolean(errors.fields.password)}
            />
          </div>
          <div id="clerk-captcha" className="min-h-0 shrink-0" />
          <FormError
            error={
              error ||
              firstAuthError(errors) ||
              null
            }
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-px"
            disabled={isBusy || !signIn || !identifier || !password}
          >
            {isBusy ? <Spinner /> : null}
            {isBusy ? "Please wait" : "Sign in"}
          </Button>
        </form>
        <p className="pt-1 text-center text-sm text-ob-mute">
          Don&apos;t have an account?{" "}
          <Link
            href={authPageHref("/sign-up", slug)}
            className="font-medium text-ob-win hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
