import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/lib/search-params";
import type {
  CreateCreditInvoiceRequest,
  CreditCollectionsFilters,
  CreditCollectionsReport,
  CreditInvoice,
  CreditInvoiceFeatureStatus,
  CreditInvoicePaymentHistory,
  CreditInvoicePaymentResult,
  CreditInvoiceSummary,
  CreditOutstandingFilters,
  CreditOutstandingReport,
  ReceiveCreditInvoicePaymentRequest,
  ReverseCreditInvoicePaymentRequest,
} from "@/types/credit-invoice";

export async function getCreditInvoiceFeatureStatus(
  signal?: AbortSignal,
): Promise<CreditInvoiceFeatureStatus> {
  return apiClient.get<CreditInvoiceFeatureStatus>("/api/credit-invoices/feature-status", {
    signal,
  });
}

export async function createCreditInvoice(
  body: CreateCreditInvoiceRequest,
): Promise<CreditInvoice> {
  return apiClient.post<CreditInvoice>("/api/credit-invoices", body);
}

export async function getCreditInvoiceByNumber(
  invoiceNumber: string,
  signal?: AbortSignal,
): Promise<CreditInvoice> {
  return apiClient.get<CreditInvoice>(
    `/api/credit-invoices/by-number/${encodeURIComponent(invoiceNumber)}`,
    { signal },
  );
}

export async function getCreditInvoicePayments(
  id: string,
  signal?: AbortSignal,
): Promise<CreditInvoicePaymentHistory> {
  return apiClient.get<CreditInvoicePaymentHistory>(`/api/credit-invoices/${id}/payments`, {
    signal,
  });
}

export async function collectCreditInvoicePayment(
  id: string,
  body: ReceiveCreditInvoicePaymentRequest,
): Promise<CreditInvoicePaymentResult> {
  return apiClient.post<CreditInvoicePaymentResult>(`/api/credit-invoices/${id}/payments`, body);
}

export async function reverseCreditInvoicePayment(
  id: string,
  paymentId: string,
  body: ReverseCreditInvoicePaymentRequest,
): Promise<CreditInvoicePaymentResult> {
  return apiClient.post<CreditInvoicePaymentResult>(
    `/api/credit-invoices/${id}/payments/${paymentId}/reverse`,
    body,
  );
}

export async function getCreditOutstandingReport(
  filters: CreditOutstandingFilters,
  signal?: AbortSignal,
): Promise<CreditOutstandingReport> {
  return apiClient.get<CreditOutstandingReport>(
    `/api/credit-invoices/reports/outstanding${toSearchParams({
      search: filters.search,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      status: filters.status,
      page: filters.page,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy,
      sortDescending: filters.sortDescending,
    })}`,
    { signal },
  );
}

export async function getCreditCollectionsReport(
  filters: CreditCollectionsFilters,
  signal?: AbortSignal,
): Promise<CreditCollectionsReport> {
  return apiClient.get<CreditCollectionsReport>(
    `/api/credit-invoices/reports/collections${toSearchParams({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      paymentMethod: filters.paymentMethod,
      page: filters.page,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy,
      sortDescending: filters.sortDescending,
    })}`,
    { signal },
  );
}

export async function getCreditInvoiceSummary(
  signal?: AbortSignal,
): Promise<CreditInvoiceSummary> {
  return apiClient.get<CreditInvoiceSummary>("/api/credit-invoices/reports/summary", { signal });
}
