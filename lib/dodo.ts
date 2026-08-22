import DodoPayments from "dodopayments";

import { decryptSecret } from "@/lib/crypto";

export function dodoEnvironment(): "test_mode" | "live_mode" {
  return process.env.NODE_ENV === "production" ? "live_mode" : "test_mode";
}

export function platformDodoClient() {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) {
    throw new Error("DODO_PAYMENTS_API_KEY is not set");
  }
  return new DodoPayments({
    bearerToken: key,
    environment: dodoEnvironment(),
  });
}

export function operatorDodoClient(apiKeyEncrypted: string) {
  const key = decryptSecret(apiKeyEncrypted);
  return new DodoPayments({
    bearerToken: key,
    environment: dodoEnvironment(),
  });
}

export function dodoClientFromApiKey(apiKey: string) {
  return new DodoPayments({
    bearerToken: apiKey,
    environment: dodoEnvironment(),
  });
}
