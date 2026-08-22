export const PLATFORM_FEE_CENTS = 1000; // $10
export const FEE_THRESHOLD_CENTS = 1000; // $10 in total bids
export const MIN_BID_CENTS = 500; // $5 default new listing
export const MIN_REBID_DELTA_CENTS = 100; // $1
export const MIN_TAKE_FIRST_DELTA_CENTS = 500; // $5 over #1

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function formatUsdFromCents(cents: number): string {
  return `$${centsToDollars(cents).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function wholeDollarsToCents(dollars: number): number {
  if (!Number.isInteger(dollars) || dollars < 1) {
    throw new Error("Amount must be a whole dollar of at least $1");
  }
  return dollars * 100;
}
