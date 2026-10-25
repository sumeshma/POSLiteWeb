import { ApiError } from "@/types/api";

const MAX_LENGTH = 80;

export type IdempotencyPrefix = "web-cr" | "web-pay" | "web-rev";

/**
 * 8–80 character key for credit invoice create, payment, and reversal.
 * Reuse the returned key when retrying the same submit.
 */
export function createIdempotencyKey(prefix: IdempotencyPrefix): string {
  const key = `${prefix}-${crypto.randomUUID()}`;
  return key.length <= MAX_LENGTH ? key : key.slice(0, MAX_LENGTH);
}

/**
 * Replace the key after a validation failure. Keep it after a network error
 * or a 409 so a retry returns the original invoice or payment.
 */
export function shouldReplaceIdempotencyKey(error: unknown): boolean {
  return error instanceof ApiError && error.status === 400;
}
