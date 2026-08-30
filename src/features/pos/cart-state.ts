import type { Product } from "@/types/product";
import type { HoldOrder, OrderType } from "@/types/billing";

export type CartCustomer = {
  id: string;
  name: string | null;
  phone: string | null;
};

export type CartLine = {
  productId: string;
  name: string;
  sku: string | null;
  unit: string | null;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  stockQuantity: number;
};

export type CartState = {
  lines: CartLine[];
  customer: CartCustomer | null;
  billDiscount: number;
  packagingCharge: number;
  notes: string;
  orderType: OrderType;
  heldOrderId: string | null;
};

export type CartAction =
  | { type: "add"; product: Product }
  | { type: "increment"; productId: string }
  | { type: "decrement"; productId: string }
  | { type: "set-quantity"; productId: string; quantity: number }
  | { type: "set-item-discount"; productId: string; discountAmount: number }
  | { type: "remove"; productId: string }
  | { type: "set-customer"; customer: CartCustomer | null }
  | { type: "set-bill-discount"; discountAmount: number }
  | { type: "set-packaging"; packagingCharge: number }
  | { type: "set-notes"; notes: string }
  | { type: "set-order-type"; orderType: OrderType }
  | { type: "load-hold"; hold: HoldOrder }
  | { type: "clear" };

export const emptyCart: CartState = {
  lines: [],
  customer: null,
  billDiscount: 0,
  packagingCharge: 0,
  notes: "",
  orderType: "Counter",
  heldOrderId: null,
};

export function productPosName(product: {
  name: string | null;
  size?: string | null;
}): string {
  return [product.name, product.size].filter(Boolean).join(" — ") || "Product";
}

function toLine(product: Product, quantity = 1): CartLine {
  return {
    productId: product.id,
    name: productPosName(product),
    sku: product.sku,
    unit: product.unit,
    unitPrice: product.price,
    quantity,
    discountAmount: 0,
    stockQuantity: product.stockQuantity,
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.lines.find((line) => line.productId === action.product.id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.productId === action.product.id
              ? {
                  ...line,
                  quantity: line.quantity + 1,
                  stockQuantity: action.product.stockQuantity,
                }
              : line,
          ),
        };
      }
      return { ...state, lines: [...state.lines, toLine(action.product)] };
    }
    case "increment":
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.productId === action.productId
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      };
    case "decrement":
      return {
        ...state,
        lines: state.lines.flatMap((line) => {
          if (line.productId !== action.productId) {
            return [line];
          }
          if (line.quantity <= 1) {
            return [];
          }
          return [{ ...line, quantity: line.quantity - 1 }];
        }),
      };
    case "set-quantity": {
      const quantity = Math.max(0, Math.floor(action.quantity));
      if (quantity <= 0) {
        return {
          ...state,
          lines: state.lines.filter((line) => line.productId !== action.productId),
        };
      }
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.productId === action.productId ? { ...line, quantity } : line,
        ),
      };
    }
    case "set-item-discount":
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.productId === action.productId
            ? { ...line, discountAmount: Math.max(0, action.discountAmount) }
            : line,
        ),
      };
    case "remove":
      return {
        ...state,
        lines: state.lines.filter((line) => line.productId !== action.productId),
      };
    case "set-customer":
      return { ...state, customer: action.customer };
    case "set-bill-discount":
      return { ...state, billDiscount: Math.max(0, action.discountAmount) };
    case "set-packaging":
      return { ...state, packagingCharge: Math.max(0, action.packagingCharge) };
    case "set-notes":
      return { ...state, notes: action.notes };
    case "set-order-type":
      return { ...state, orderType: action.orderType };
    case "load-hold": {
      const items = action.hold.items ?? [];
      return {
        ...emptyCart,
        heldOrderId: action.hold.id,
        billDiscount: action.hold.discountAmount,
        customer: action.hold.customerName
          ? { id: "", name: action.hold.customerName, phone: null }
          : null,
        lines: items.map((item) => ({
          productId: item.productId,
          name: item.productName ?? "Product",
          sku: item.sku,
          unit: item.unit,
          unitPrice: item.rate,
          quantity: item.quantity,
          discountAmount: item.discountAmount,
          stockQuantity: 0,
        })),
      };
    }
    case "clear":
      return emptyCart;
    default:
      return state;
  }
}
