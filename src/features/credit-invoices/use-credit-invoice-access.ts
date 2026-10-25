"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { permissions } from "@/config/permissions";
import { isAdmin } from "@/lib/permissions";
import { ApiError } from "@/types/api";
import { useCreditInvoiceFeatureStatusQuery } from "./use-credit-invoices";

export const CREDIT_INVOICES_DISABLED_MESSAGE = "Credit invoices are turned off for this shop.";

export function isCreditInvoicesDisabledError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.message === CREDIT_INVOICES_DISABLED_MESSAGE
  );
}

/**
 * Create, collect, and reverse require the shop flag and `credit.invoices`.
 * Admins can still read history and reports when the flag is off.
 */
export function useCreditInvoiceAccess() {
  const { can, session } = useAuth();
  const allowed = can(permissions.creditInvoices);
  const admin = isAdmin(session?.user.role);
  const featureQuery = useCreditInvoiceFeatureStatusQuery({ enabled: allowed });
  const enabled = featureQuery.data?.isCreditInvoiceEnabled === true;

  return {
    allowed,
    admin,
    enabled,
    canMutate: allowed && enabled,
    canRead: allowed && (admin || enabled),
    featureQuery,
  };
}
