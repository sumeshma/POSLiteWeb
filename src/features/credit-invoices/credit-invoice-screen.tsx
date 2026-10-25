"use client";

import type { ReactNode } from "react";
import { RequirePermission } from "@/components/auth/require-permission";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { permissions } from "@/config/permissions";
import { getErrorMessage } from "@/types/api";
import {
  CREDIT_INVOICES_DISABLED_MESSAGE,
  useCreditInvoiceAccess,
} from "./use-credit-invoice-access";

type CreditInvoiceScreenProps = {
  mode: "read" | "mutate";
  children: ReactNode;
};

export function CreditInvoiceScreen({ mode, children }: CreditInvoiceScreenProps) {
  const access = useCreditInvoiceAccess();
  const open = mode === "mutate" ? access.canMutate : access.canRead;

  let body: ReactNode;
  if (access.featureQuery.isLoading) {
    body = <LoadingState label="Checking credit invoices..." />;
  } else if (access.featureQuery.isError) {
    body = (
      <ErrorState
        title="Unable to check credit invoices"
        description={getErrorMessage(access.featureQuery.error)}
        onRetry={() => void access.featureQuery.refetch()}
      />
    );
  } else if (!open) {
    body = (
      <EmptyState
        title="Credit invoices are turned off"
        description={
          mode === "mutate"
            ? `${CREDIT_INVOICES_DISABLED_MESSAGE} Turn the shop flag on before creating an invoice or taking a payment.`
            : CREDIT_INVOICES_DISABLED_MESSAGE
        }
      />
    );
  } else {
    body = children;
  }

  return (
    <RequirePermission permission={permissions.creditInvoices}>
      <PageContainer>{body}</PageContainer>
    </RequirePermission>
  );
}
