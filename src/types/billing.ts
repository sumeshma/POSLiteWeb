export const PAYMENT_METHODS = ["Cash", "Upi", "Card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_TYPES = ["Counter", "Parcel"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export type CheckoutItemRequest = {
  productId: string;
  quantity: number;
  discountAmount: number;
};

export type CheckoutRequest = {
  items: CheckoutItemRequest[];
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string | null;
  orderType: OrderType;
  packagingCharge: number;
  discountAmount: number;
  notes?: string | null;
  heldOrderId?: string | null;
  customerId?: string | null;
  loyaltyPointsRedeemed?: number;
};

export type BillItem = {
  productId: string;
  productName: string | null;
  sku: string | null;
  unit: string | null;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  lineTotal: number;
  hsnCode: string | null;
  taxRatePercent: number;
  taxableAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
};

export type Bill = {
  id: string;
  billNumber: string | null;
  cashierName: string | null;
  subTotal: number;
  discountAmount: number;
  packagingCharge: number;
  taxableAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  loyaltyRedemptionAmount: number;
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  totalAmount: number;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  orderType: string | null;
  notes: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  amountPaid: number;
  changeAmount: number;
  status: string | null;
  printCount: number;
  lastPrintedAt: string | null;
  createdAt: string;
  items: BillItem[] | null;
};

export type HoldOrderItemRequest = {
  productId: string;
  quantity: number;
  discountAmount: number;
};

export type HoldOrderRequest = {
  items: HoldOrderItemRequest[];
  customerName?: string | null;
  discountAmount: number;
};

export type HoldOrderItem = {
  productId: string;
  productName: string | null;
  sku: string | null;
  unit: string | null;
  rate: number;
  quantity: number;
  discountAmount: number;
  amount: number;
};

export type HoldOrder = {
  id: string;
  holdNumber: string | null;
  holdDateTime: string;
  customerName: string | null;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  status: string | null;
  createdBy: string | null;
  items: HoldOrderItem[] | null;
};

export type ShopSettings = {
  businessName: string | null;
  appDisplayName: string | null;
  logoImageUrl: string | null;
  gstin: string | null;
  address: string | null;
  phoneNumber: string | null;
  selectedUiPickupId: number;
  selectedUiPickupName: string | null;
  allowSellWhenOutOfStock: boolean;
  isGstEnabled: boolean;
};
