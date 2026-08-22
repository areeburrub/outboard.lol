type ClerkLikeError = {
  message?: string;
  longMessage?: string;
  errors?: ClerkLikeError[];
};

function messageFrom(error: ClerkLikeError | null | undefined) {
  return error?.longMessage || error?.message || null;
}

export function getClerkErrorMessage(error: unknown, fallback: string) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "object") {
    const value = error as ClerkLikeError;
    const direct = messageFrom(value);
    if (direct && direct !== "ClerkError") {
      return direct;
    }

    const nested = messageFrom(value.errors?.[0]);
    if (nested) {
      return nested;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function firstAuthError(
  errors: {
    fields: object;
    global: { message?: string; longMessage?: string }[] | null;
  },
  fallback?: string,
) {
  for (const field of Object.values(
    errors.fields as Record<string, ClerkLikeError | null>,
  )) {
    const message = messageFrom(field);
    if (message) {
      return message;
    }
  }

  const global = messageFrom(errors.global?.[0]);
  if (global) {
    return global;
  }

  return fallback ?? null;
}
