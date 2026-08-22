"use client";

import {
  CaretDownIcon,
  CheckCircleIcon,
  CircleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { connectDodo } from "@/lib/actions/dodo-connect";
import { cn } from "@/lib/utils";

const SETUP_STEPS = [
  "Checking your API key",
  "Creating Pay What You Want product",
  "Registering webhook",
  "Saving connection",
] as const;

type StepState = "pending" | "active" | "done" | "error";

function KeyForm({
  connected,
  pending,
  apiKey,
  setApiKey,
  showProgress,
  stepState,
  error,
  success,
  onSubmit,
}: {
  connected: boolean;
  pending: boolean;
  apiKey: string;
  setApiKey: (v: string) => void;
  showProgress: boolean;
  stepState: (index: number) => StepState;
  error: string | null;
  success: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3">
      {!connected ? (
        <p className="text-sm text-ob-mute">
          Already have a Dodo Payments API key? Paste it below. We validate it,
          wire up bidding checkout, and save the connection — about a minute.
        </p>
      ) : (
        <p className="text-sm text-ob-mute">
          Paste a new key to reconnect. We redo product and webhook setup for
          you.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="dodo-key">Dodo Payments API key</Label>
        <Input
          id="dodo-key"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk_live_…"
          disabled={pending}
          className="h-11 rounded-full px-4 font-mono text-sm"
        />
      </div>

      {showProgress ? (
        <ol className="space-y-3 rounded-[1rem] border border-ob-line bg-ob-surface px-4 py-4">
          {SETUP_STEPS.map((label, index) => {
            const state = stepState(index);
            return (
              <li key={label} className="flex items-center gap-3 text-sm">
                {state === "done" ? (
                  <CheckCircleIcon
                    weight="fill"
                    className="size-5 shrink-0 text-ob-win"
                  />
                ) : state === "active" ? (
                  <SpinnerIcon className="size-5 shrink-0 animate-spin text-ob-ink" />
                ) : state === "error" ? (
                  <CircleIcon
                    weight="fill"
                    className="size-5 shrink-0 text-destructive"
                  />
                ) : (
                  <CircleIcon className="size-5 shrink-0 text-ob-line" />
                )}
                <span
                  className={cn(
                    state === "done" && "text-ob-ink",
                    state === "active" && "font-medium text-ob-ink",
                    state === "pending" && "text-ob-mute",
                    state === "error" && "text-destructive",
                  )}
                >
                  {label}
                  {state === "active" ? "…" : null}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? (
        <p className="text-sm text-ob-win">
          Payments ready. Your board can take bids.
        </p>
      ) : null}

      <Button
        type="button"
        size="lg"
        disabled={pending || !apiKey.trim()}
        onClick={onSubmit}
        className="h-12 rounded-full px-8 text-sm font-semibold"
      >
        {pending
          ? "Setting up…"
          : connected
            ? "Reconnect with new key"
            : "Connect and go live"}
      </Button>
    </div>
  );
}

export function DodoConnectForm({
  connected,
  keyLast4,
  productId,
  connectedAt,
  platformFeePaid = false,
}: {
  connected: boolean;
  keyLast4: string | null;
  productId: string | null;
  connectedAt: string | null;
  platformFeePaid?: boolean;
}) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [failedStep, setFailedStep] = useState(-1);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
    };
  }, []);

  function clearTick() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function stepState(index: number): StepState {
    if (failedStep === index) {
      return "error";
    }
    if (
      success ||
      (!pending && failedStep < 0 && activeStep >= SETUP_STEPS.length)
    ) {
      return "done";
    }
    if (success) {
      return "done";
    }
    if (index < activeStep && failedStep < 0) {
      return "done";
    }
    if (pending && index === activeStep) {
      return "active";
    }
    if (!pending && !success && activeStep < 0 && failedStep < 0) {
      return "pending";
    }
    if (index < activeStep) {
      return "done";
    }
    return "pending";
  }

  function submit() {
    setError(null);
    setSuccess(false);
    setFailedStep(-1);
    stepRef.current = 0;
    setActiveStep(0);
    clearTick();

    tickRef.current = setInterval(() => {
      stepRef.current = Math.min(stepRef.current + 1, SETUP_STEPS.length - 1);
      setActiveStep(stepRef.current);
    }, 1100);

    startTransition(async () => {
      const result = await connectDodo(apiKey);
      clearTick();

      if (!result.ok) {
        setFailedStep(stepRef.current);
        setError(result.error);
        return;
      }

      stepRef.current = SETUP_STEPS.length;
      setActiveStep(SETUP_STEPS.length);
      setSuccess(true);
      setApiKey("");
    });
  }

  const showProgress = pending || success || failedStep >= 0;
  const formProps = {
    connected,
    pending,
    apiKey,
    setApiKey,
    showProgress,
    stepState,
    error,
    success,
    onSubmit: submit,
  };

  if (!connected) {
    return <KeyForm {...formProps} />;
  }

  return (
    <div className="overflow-hidden rounded-[1rem] border border-ob-line bg-ob-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ob-paper/60"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-ob-ink">Payment settings</p>
            <span className="inline-flex h-5 items-center rounded-full bg-ob-win-soft px-2.5 font-mono text-[0.65rem] font-semibold leading-none tracking-wider text-ob-ink uppercase">
              Configured
            </span>
            {platformFeePaid ? (
              <span className="inline-flex h-5 items-center rounded-full bg-ob-win-soft px-2.5 font-mono text-[0.65rem] font-semibold leading-none tracking-wider text-ob-ink uppercase">
                Paid
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-ob-mute">
            Dodo Payments is connected. Bids settle in your account.
            {platformFeePaid
              ? " Platform fee is covered — bidding will not pause."
              : null}
            {keyLast4 ? (
              <>
                {" "}
                Key ending{" "}
                <span className="font-mono text-ob-ink">••••{keyLast4}</span>.
              </>
            ) : null}
          </p>
        </div>
        <CaretDownIcon
          weight="bold"
          className={cn(
            "size-5 shrink-0 text-ob-mute transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-5 border-t border-ob-line px-5 py-5">
          <dl className="grid gap-3 font-mono text-xs text-ob-mute sm:grid-cols-2">
            <div>
              <dt className="uppercase tracking-wider">API key</dt>
              <dd className="mt-0.5 text-ob-ink">••••{keyLast4}</dd>
            </div>
            {connectedAt ? (
              <div>
                <dt className="uppercase tracking-wider">Connected</dt>
                <dd className="mt-0.5 text-ob-ink">
                  {new Date(connectedAt).toLocaleString()}
                </dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="uppercase tracking-wider">Product ID</dt>
              <dd className="mt-0.5 break-all text-ob-ink">{productId}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="uppercase tracking-wider">Platform fee</dt>
              <dd className="mt-0.5 text-ob-ink">
                {platformFeePaid
                  ? "Paid — board will not pause at $10 in bids"
                  : "Not paid yet"}
              </dd>
            </div>
          </dl>
          <KeyForm {...formProps} />
        </div>
      ) : null}
    </div>
  );
}
