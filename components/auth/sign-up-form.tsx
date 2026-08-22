"use client";

import { useSignUp } from "@clerk/nextjs";
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

import { normalizeSlug, slugError } from "@/lib/slug";

import { AuthDivider } from "./auth-divider";
import { AuthFormHeading } from "./auth-form-heading";
import { EmailVerificationOtp } from "./email-verification-otp";
import { FormError } from "./form-error";
import { GoogleOAuthButton } from "./google-oauth-button";
import { PasswordField } from "./password-field";
import { SlugField } from "./slug-field";

export function SignUpForm({ slug }: { slug?: string }) {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [username, setUsername] = useState(slug ?? "");
  const afterAuth = afterAuthPath(username || slug);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const isBusy = fetchStatus === "fetching";
  const needsUsernameContinue = Boolean(
    signUp?.id && signUp.missingFields.includes("username") && !signUp.username,
  );

  useEffect(() => {
    persistClaimSlug(username || slug);
  }, [slug, username]);

  const finish = useCallback(async () => {
    if (!signUp) {
      setError("Unable to complete sign up. Please try again.");
      return;
    }

    const { error: finalizeError } = await signUp.finalize({
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
          "Unable to complete sign up. Please try again.",
        ),
      );
    }
  }, [afterAuth, signUp]);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (isBusy) {
      return;
    }

    setError(null);
    setUsernameError(null);
    setPasswordError(null);

    if (!signUp) {
      setError("Sign up is still loading. Please try again.");
      return;
    }

    const nextUsername = normalizeSlug(username);
    const nextSlugError = slugError(nextUsername);
    if (nextSlugError) {
      setUsernameError(nextSlugError);
      return;
    }

    persistClaimSlug(nextUsername);

    const { error: createError } = await signUp.password({
      firstName,
      lastName,
      emailAddress,
      password,
      username: nextUsername,
    });

    if (createError) {
      const message = getClerkErrorMessage(
        createError,
        "Could not create your account. Please try again.",
      );
      const lower = message.toLowerCase();

      if (lower.includes("username") || lower.includes("slug")) {
        setUsernameError(message);
      } else if (
        lower.includes("password") ||
        lower.includes("character") ||
        lower.includes("8 characters")
      ) {
        setPasswordError(message);
      } else {
        setError(message);
      }
      return;
    }

    if (signUp.status === "complete") {
      await finish();
      return;
    }

    if (signUp.unverifiedFields.includes("email_address")) {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(
          getClerkErrorMessage(
            sendError,
            "Could not send a verification code. Please try again.",
          ),
        );
        return;
      }
      setVerifying(true);
      return;
    }

    if (signUp.protectCheck) {
      setError("Please complete the verification challenge, then try again.");
      return;
    }

    const missing = (signUp.missingFields ?? []).filter(
      (field) => field !== "email_address",
    );
    setError(
      missing.length > 0
        ? `Please complete: ${missing.join(", ")}`
        : firstAuthError(errors, "Could not create your account. Please try again."),
    );
  };

  const handleResendCode = async () => {
    setError(null);
    setIsResending(true);

    if (!signUp) {
      setIsResending(false);
      return;
    }

    try {
      const { error: resendError } =
        await signUp.verifications.sendEmailCode();
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

  const handleVerify = async (event?: React.FormEvent, nextCode?: string) => {
    event?.preventDefault();
    const value = nextCode ?? code;

    if (value.length !== 6 || isBusy || !signUp) {
      return;
    }

    setError(null);

    const { error: verifyError } =
      await signUp.verifications.verifyEmailCode({ code: value });

    if (verifyError) {
      setError(getClerkErrorMessage(verifyError, "Invalid code. Please try again."));
      return;
    }

    if (signUp.status === "complete") {
      await finish();
      return;
    }

    setError("Verification failed. Please check your code and try again.");
  };

  const handleUsernameContinue = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setUsernameError(null);

    if (!signUp) {
      return;
    }

    const nextUsername = normalizeSlug(username);
    const nextSlugError = slugError(nextUsername);
    if (nextSlugError) {
      setUsernameError(nextSlugError);
      return;
    }

    persistClaimSlug(nextUsername);

    const { error: updateError } = await signUp.update({
      username: nextUsername,
    });

    if (updateError) {
      setUsernameError(
        getClerkErrorMessage(updateError, "Could not claim that name. Try another."),
      );
      return;
    }

    if (signUp.status === "complete") {
      await finish();
      return;
    }

    if (signUp.unverifiedFields.includes("email_address")) {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(
          getClerkErrorMessage(
            sendError,
            "Could not send a verification code. Please try again.",
          ),
        );
        return;
      }
      setVerifying(true);
      return;
    }

    setError(
      firstAuthError(errors, "Could not finish sign up. Please try again."),
    );
  };

  if (verifying) {
    return (
      <EmailVerificationOtp
        email={emailAddress}
        code={code}
        onCodeChange={setCode}
        onResend={handleResendCode}
        onChangeEmail={() => {
          setVerifying(false);
          setCode("");
          setError(null);
        }}
        error={error}
        isLoading={isBusy}
        isResending={isResending}
        onSubmit={handleVerify}
      />
    );
  }

  if (needsUsernameContinue) {
    return (
      <div className="w-full">
        <AuthFormHeading
          title="Name your board"
          subtitle="People will find you at this address."
        />
        <form
          onSubmit={(event) => void handleUsernameContinue(event)}
          className="mt-8 flex flex-col gap-3"
        >
          <SlugField
            value={username}
            onChange={(value) => {
              setUsername(value);
              setUsernameError(null);
            }}
            disabled={isBusy}
            invalid={Boolean(usernameError || errors.fields.username)}
            hint={usernameError || errors.fields.username?.longMessage || errors.fields.username?.message}
          />
          <FormError error={error} />
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-px"
            disabled={isBusy || !signUp || !username}
          >
            {isBusy ? <Spinner /> : null}
            {isBusy ? "Please wait" : "Claim this board"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AuthFormHeading
        title="Create your account"
        subtitle={
          username
            ? `Claim ${username}.outboard.lol, then paste a Dodo key.`
            : "Pick a name. That’s your board address."
        }
      />
      <div className="mt-8 space-y-4">
        <GoogleOAuthButton
          loading={isGoogleLoading}
          disabled={!signUp || isBusy}
          onClick={async () => {
            if (!signUp || isGoogleLoading) {
              return;
            }
            setIsGoogleLoading(true);
            setError(null);
            persistClaimSlug(slug);
            try {
              const { error: oauthError } = await signUp.sso({
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
        <form
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
          className="flex flex-col gap-3"
        >
          <SlugField
            value={username}
            onChange={(value) => {
              setUsername(value);
              setUsernameError(null);
            }}
            disabled={isBusy}
            invalid={Boolean(usernameError || errors.fields.username)}
            hint={
              usernameError ||
              errors.fields.username?.longMessage ||
              errors.fields.username?.message ||
              "People will visit this address."
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Ada"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                disabled={isBusy}
                aria-invalid={Boolean(errors.fields.firstName) || undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Lovelace"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                disabled={isBusy}
                aria-invalid={Boolean(errors.fields.lastName) || undefined}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              required
              disabled={isBusy}
              aria-invalid={Boolean(errors.fields.emailAddress) || undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordField
              id="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setPasswordError(null);
              }}
              disabled={isBusy}
              autoComplete="new-password"
              invalid={Boolean(passwordError || errors.fields.password)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <p
              className={`overflow-hidden text-sm transition-all ${
                isPasswordFocused || passwordError
                  ? "max-h-12 opacity-100"
                  : "max-h-0 opacity-0"
              } ${passwordError ? "text-destructive" : "text-ob-mute"}`}
            >
              {passwordError || "Use 8 or more characters."}
            </p>
          </div>
          <div
            id="clerk-captcha"
            data-cl-theme="auto"
            data-cl-size="flexible"
          />
          <FormError
            error={
              error ||
              firstAuthError({
                fields: {
                  ...errors.fields,
                  password: null,
                },
                global: errors.global,
              }) ||
              null
            }
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-px"
            disabled={
              isBusy ||
              !signUp ||
              !username ||
              !firstName ||
              !lastName ||
              !emailAddress ||
              !password
            }
          >
            {isBusy ? <Spinner /> : null}
            {isBusy ? "Please wait" : "Create account"}
          </Button>
        </form>
        <p className="pt-1 text-center text-sm text-ob-mute">
          Already have an account?{" "}
          <Link
            href={authPageHref("/sign-in", slug)}
            className="font-medium text-ob-win hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
