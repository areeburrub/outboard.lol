"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

type PasswordFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  invalid?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function PasswordField({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  invalid,
  onFocus,
  onBlur,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        required
        aria-invalid={invalid || undefined}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return;
          }
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
        }}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((current) => !current)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-ob-mute transition-colors hover:text-ob-ink"
        disabled={disabled}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeSlashIcon size={20} weight="duotone" />
        ) : (
          <EyeIcon size={20} weight="duotone" />
        )}
      </button>
    </div>
  );
}
