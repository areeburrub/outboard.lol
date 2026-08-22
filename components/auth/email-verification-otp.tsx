"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

import { FormError } from "./form-error";

type EmailVerificationOtpProps = {
  email: string;
  code: string;
  onCodeChange: (value: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
  error: string | null;
  isLoading: boolean;
  isResending: boolean;
  onSubmit: (event?: React.FormEvent, nextCode?: string) => void;
};

export function EmailVerificationOtp({
  email,
  code,
  onCodeChange,
  onResend,
  onChangeEmail,
  error,
  isLoading,
  isResending,
  onSubmit,
}: EmailVerificationOtpProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full space-y-5">
      <div className="text-center">
        <h2 className="font-display text-[1.625rem] leading-8 font-bold tracking-[-0.03em] text-ob-ink">
          Check your email
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-ob-mute">
          We sent a code to{" "}
          <span className="font-medium text-ob-ink">{email}</span>{" "}
          <button
            type="button"
            onClick={onChangeEmail}
            className="text-ob-win hover:underline"
          >
            (change)
          </button>
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <InputOTP
          ref={inputRef}
          id="code"
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={code}
          onChange={(value) => {
            onCodeChange(value);
            if (value.length === 6) {
              onSubmit(undefined, value);
            }
          }}
          disabled={isLoading}
          autoFocus
          autoComplete="one-time-code"
          containerClassName="w-full"
          aria-label="Verification code"
          aria-invalid={Boolean(error) || undefined}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                aria-invalid={Boolean(error) || undefined}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p className="text-center text-sm text-ob-mute">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="font-medium text-ob-win hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend"}
          </button>
        </p>
        <FormError error={error} />
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-full text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-px"
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? <Spinner /> : null}
          {isLoading ? "Verifying..." : "Verify code"}
        </Button>
      </form>
    </div>
  );
}
