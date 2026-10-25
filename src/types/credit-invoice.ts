import type { OrderType } from "@/types/billing";

export const CREDIT_INVOICE_PAYMENT_METHODS = ["Cash", "UPI", "Card"] as const;
export type CreditInvoicePaymentMethod = (typeof CREDIT_INVOICE_PAYMENT_METHODS)[number];

export const CREDIT_INVOICE_STATUSES = ["Open", "PartiallyPaid", "Paid", "Cancelled"] as const;
export type CreditInvoiceStatus = (typeof CREDIT_INVOICE_STATUSES)[number];

export const CREDIT_OUTSTANDING_STATUS_FILTERS = [
  "outstanding",
  "all",
  ...CREDIT_INVOICE_STATUSES,
] as const;
export type CreditOutstandingStatusFilter = (typeof CREDIT_OUTSTANDING_STATUS_FILTERS)[number];

export const CREDIT_PAYMENT_STATUSES = ["Posted", "Reversed"] as const;
export type CreditPaymentStatus = (typeof CREDIT_PAYMENT_STATUSES)[number];

export const CREDIT_OUTSTANDING_SORTS = [
  "invoiceDate",
  "invoiceNumber",
  "customer",
  "total",
  "paid",
  "balance",
  "status",
] as const;
export type CreditOutstandingSort = (typeof CREDIT_OUTSTANDING_SORTS)[number];

export const CREDIT_COLLECTION_SORTS = [
  "paidAt",
  "receiptNumber",
  "amount",
  "customer",
  "method",
] as const;
export type CreditCollectionSort = (typeof CREDIT_COLLECTION_SORTS)[number];

export type CreditInvoiceFeatureStatus = {
  isCreditInvoiceEnabled: boolean;
};

export type CreateCreditInvoiceItemRequest = {
  productId: string;
  quantity: number;
  discountAmount: number;
};

export type CreateCreditInvoiceRequest = {
  idempotencyKey: string;
  customerName: string;
  customerPhone?: string | null;
  customerId?: string | null;
  orderType: OrderType;
  packagingCharge: number;
  discountAmount: number;
  notes?: string | null;
  items: CreateCreditInvoiceItemRequest[];
};

export type CreditInvoiceItem = {
  productId: string;
  productName: string | null;
  sku: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal: number;
  taxAmount: number;
};

export type CreditInvoice = {
  id: string;
  invoiceNumber: string | null;
  status: string | null;
  customerName: string | null;
  customerPhone: string | null;
  subTotal: number;
  discountAmount: number;
  packagingCharge: number;
  taxableAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  items: CreditInvoiceItem[] | null;
};

export type CreditInvoicePayment = {
  id: string;
  creditInvoiceId: string;
  receiptNumber: string | null;
  amount: number;
  paymentMethod: string | null;
  transactionReference: string | null;
  notes: string | null;
  paidAt: string;
  cashierId: string;
  status: string | null;
  reversalReason: string | null;
  reversedAt: string | null;
};

export type CreditInvoicePaymentHistory = {
  creditInvoiceId: string;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  customerName: string | null;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  netAmountCollected: number;
  payments: CreditInvoicePayment[] | null;
};

export type ReceiveCreditInvoicePaymentRequest = {
  idempotencyKey: string;
  amount: number;
  paymentMethod: CreditInvoicePaymentMethod;
  transactionReference?: string | null;
  notes?: string | null;
};

export type ReverseCreditInvoicePaymentRequest = {
  idempotencyKey: string;
  reason: string;
};

export type CreditInvoicePaymentResult = {
  payment: CreditInvoicePayment;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
};

export type CreditOutstandingFilters = {
  search?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
};

export type CreditOutstandingRow = {
  id: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  customerName: string | null;
  customerPhone: string | null;
  totalAmount: number;
  netPayments: number;
  outstandingBalance: number;
  status: string | null;
  dueDate: string | null;
};

export type CreditOutstandingReport = {
  items: CreditOutstandingRow[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  totalInvoiceAmount: number;
  netPayments: number;
  outstandingBalance: number;
  dueDatesSupported: boolean;
  timeZoneLabel: string | null;
};

export type CreditCollectionsFilters = {
  fromDate?: string;
  toDate?: string;
  paymentMethod?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
};

export type CreditCollectionRow = {
  id: string;
  receiptNumber: string | null;
  invoiceNumber: string | null;
  customerName: string | null;
  paidAt: string;
  paymentMethod: string | null;
  amount: number;
  transactionReference: string | null;
  cashierName: string | null;
  status: string | null;
};

export type CreditCollectionsReport = {
  items: CreditCollectionRow[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  grossCollections: number;
  reversedCollections: number;
  netCollections: number;
  timeZoneLabel: string | null;
};

export type CreditInvoiceSummary = {
  outstandingBalance: number;
  outstandingInvoices: number;
  collectionsToday: number;
  reversedToday: number;
  shopDate: string | null;
  timeZoneLabel: string | null;
  dueDatesSupported: boolean;
};
