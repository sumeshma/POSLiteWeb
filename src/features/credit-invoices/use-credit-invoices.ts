"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/query-keys";
import {
  collectCreditInvoicePayment,
  createCreditInvoice,
  getCreditCollectionsReport,
  getCreditInvoiceByNumber,
  getCreditInvoiceFeatureStatus,
  getCreditInvoicePayments,
  getCreditInvoiceSummary,
  getCreditOutstandingReport,
  reverseCreditInvoicePayment,
} from "@/services/credit-invoices.service";
import type {
  CreateCreditInvoiceRequest,
  CreditCollectionsFilters,
  CreditOutstandingFilters,
  ReceiveCreditInvoicePaymentRequest,
  ReverseCreditInvoicePaymentRequest,
} from "@/types/credit-invoice";

export function useCreditInvoiceFeatureStatusQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.creditInvoices.featureStatus(),
    queryFn: ({ signal }) => getCreditInvoiceFeatureStatus(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useCreditInvoiceSummaryQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.creditInvoices.summary(),
    queryFn: ({ signal }) => getCreditInvoiceSummary(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useCreditInvoiceByNumberQuery(
  invoiceNumber: string | null,
  options?: { enabled?: boolean },
) {
  const number = invoiceNumber?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.creditInvoices.byNumber(number),
    queryFn: ({ signal }) => getCreditInvoiceByNumber(number, signal),
    enabled: (options?.enabled ?? true) && number.length > 0,
  });
}

export function useCreditInvoicePaymentsQuery(id: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.creditInvoices.payments(id ?? ""),
    queryFn: ({ signal }) => getCreditInvoicePayments(id!, signal),
    enabled: (options?.enabled ?? true) && Boolean(id),
  });
}

export function useCreditOutstandingQuery(
  filters: CreditOutstandingFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.creditInvoices.outstanding(filters),
    queryFn: ({ signal }) => getCreditOutstandingReport(filters, signal),
    enabled: options?.enabled ?? true,
  });
}

export function useCreditCollectionsQuery(
  filters: CreditCollectionsFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.creditInvoices.collections(filters),
    queryFn: ({ signal }) => getCreditCollectionsReport(filters, signal),
    enabled: (options?.enabled ?? true) && Boolean(filters.fromDate && filters.toDate),
  });
}

export function useCreditInvoiceMutations() {
  const queryClient = useQueryClient();

  function invalidateCredit() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.creditInvoices.all() });
  }

  const create = useMutation({
    mutationFn: (body: CreateCreditInvoiceRequest) => createCreditInvoice(body),
    onSuccess: () => {
      invalidateCredit();
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all() });
    },
  });

  const collect = useMutation({
    mutationFn: (vars: { id: string; body: ReceiveCreditInvoicePaymentRequest }) =>
      collectCreditInvoicePayment(vars.id, vars.body),
    onSuccess: invalidateCredit,
  });

  const reverse = useMutation({
    mutationFn: (vars: {
      id: string;
      paymentId: string;
      body: ReverseCreditInvoicePaymentRequest;
    }) => reverseCreditInvoicePayment(vars.id, vars.paymentId, vars.body),
    onSuccess: invalidateCredit,
  });

  return { create, collect, reverse };
}
