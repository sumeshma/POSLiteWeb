"use client";

import { Minus, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { ORDER_TYPES } from "@/types/billing";
import type { CartCustomer, CartLine, CartState } from "./cart-state";
import { estimateCartTotals, lineNet } from "./cart-totals";

type PosCartPanelProps = {
  cart: CartState;
  gstEnabled: boolean;
  canCheckout: boolean;
  holdCount: number;
  submitting: boolean;
  variant?: "standard" | "machine";
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onQuantity: (productId: string, quantity: number) => void;
  onItemDiscount: (productId: string, discountAmount: number) => void;
  onRemove: (productId: string) => void;
  onBillDiscount: (value: number) => void;
  onPackaging: (value: number) => void;
  onOrderType: (value: CartState["orderType"]) => void;
  onSelectCustomer: () => void;
  onClearCustomer: () => void;
  onHold: () => void;
  onHeldOrders: () => void;
  onClear: () => void;
  onCheckout: () => void;
};

function customerLabel(customer: CartCustomer | null): string {
  if (!customer) {
    return "Walk-in";
  }
  return customer.name || customer.phone || "Customer";
}

export function PosCartPanel({
  cart,
  gstEnabled,
  canCheckout,
  holdCount,
  submitting,
  variant = "standard",
  onIncrement,
  onDecrement,
  onQuantity,
  onItemDiscount,
  onRemove,
  onBillDiscount,
  onPackaging,
  onOrderType,
  onSelectCustomer,
  onClearCustomer,
  onHold,
  onHeldOrders,
  onClear,
  onCheckout,
}: PosCartPanelProps) {
  const totals = estimateCartTotals(cart.lines, cart.billDiscount, cart.packagingCharge);
  const machine = variant === "machine";
  const payLabel = machine
    ? `PAY ${formatCurrency(totals.totalAmount)}`
    : `Checkout ${formatCurrency(totals.totalAmount)}`;

  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-border bg-card">
      <div className={cn("flex items-start justify-between gap-2 border-b", machine ? "p-4" : "p-3")}>
        <div>
          <p className={cn("font-medium", machine && "text-base")}>Current order</p>
          <p className="text-xs text-muted-foreground">
            {cart.heldOrderId ? "Resumed hold" : "New sale"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size={machine ? "lg" : "sm"}
          onClick={onHeldOrders}
        >
          Holds{holdCount > 0 ? ` (${holdCount})` : ""}
        </Button>
      </div>

      <div className={cn("flex items-center gap-2 border-b", machine ? "p-4" : "p-3")}>
        <UserRound className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{customerLabel(cart.customer)}</p>
          {cart.customer?.phone ? (
            <p className="truncate text-xs text-muted-foreground">{cart.customer.phone}</p>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size={machine ? "default" : "sm"} onClick={onSelectCustomer}>
          {cart.customer ? "Change" : "Customer"}
        </Button>
        {cart.customer ? (
          <Button type="button" variant="ghost" size={machine ? "default" : "sm"} onClick={onClearCustomer}>
            Walk-in
          </Button>
        ) : null}
      </div>

      <div className={cn("min-h-0 flex-1 overflow-y-auto", machine ? "p-4" : "p-3")}>
        {cart.lines.length === 0 ? (
          <EmptyState
            title="Cart is empty"
            description="Search or tap a product to add it to the bill."
          />
        ) : (
          <ul className={cn(machine ? "space-y-4" : "space-y-3")}>
            {cart.lines.map((line) => (
              <CartLineRow
                key={line.productId}
                line={line}
                machine={machine}
                onIncrement={() => onIncrement(line.productId)}
                onDecrement={() => onDecrement(line.productId)}
                onQuantity={(value) => onQuantity(line.productId, value)}
                onItemDiscount={(value) => onItemDiscount(line.productId, value)}
                onRemove={() => onRemove(line.productId)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className={cn("space-y-3 border-t", machine ? "p-4" : "p-3")}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="pos-order-type" className="text-xs">
              Order type
            </Label>
            <Select
              value={cart.orderType}
              onValueChange={(value) =>
                onOrderType(value === "Parcel" ? "Parcel" : "Counter")
              }
            >
              <SelectTrigger id="pos-order-type" className={cn("w-full", machine && "h-10")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="pos-packaging" className="text-xs">
              Packaging
            </Label>
            <Input
              id="pos-packaging"
              type="number"
              min={0}
              step="0.01"
              className={machine ? "h-10" : undefined}
              value={cart.packagingCharge || ""}
              onChange={(event) => onPackaging(Number(event.target.value) || 0)}
            />
          </div>
          <div className="space-y-1 col-span-2">
            <Label htmlFor="pos-discount" className="text-xs">
              Bill discount
            </Label>
            <Input
              id="pos-discount"
              type="number"
              min={0}
              step="0.01"
              className={machine ? "h-10" : undefined}
              value={cart.billDiscount || ""}
              onChange={(event) => onBillDiscount(Number(event.target.value) || 0)}
            />
          </div>
        </div>

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatCurrency(totals.subTotal)}</dd>
          </div>
          {totals.discountAmount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Bill discount</dt>
              <dd className="tabular-nums">-{formatCurrency(totals.discountAmount)}</dd>
            </div>
          ) : null}
          {totals.packagingCharge > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Packaging</dt>
              <dd className="tabular-nums">{formatCurrency(totals.packagingCharge)}</dd>
            </div>
          ) : null}
          <div className={cn("flex justify-between font-semibold", machine ? "text-xl" : "text-base")}>
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(totals.totalAmount)}</dd>
          </div>
        </dl>
        {gstEnabled ? (
          <p className="text-xs text-muted-foreground">
            Tax is calculated by the server at checkout.
          </p>
        ) : null}

        <div className={cn("grid grid-cols-2", machine ? "gap-3" : "gap-2")}>
          <Button
            type="button"
            variant="outline"
            size={machine ? "lg" : "default"}
            onClick={onClear}
            disabled={cart.lines.length === 0}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="outline"
            size={machine ? "lg" : "default"}
            onClick={onHold}
            disabled={cart.lines.length === 0 || submitting}
          >
            Hold
          </Button>
          <Button
            type="button"
            className={cn("col-span-2", machine && "h-14 text-base font-semibold")}
            onClick={onCheckout}
            disabled={!canCheckout || submitting}
          >
            {payLabel}
          </Button>
        </div>
      </div>
    </aside>
  );
}

function CartLineRow({
  line,
  machine,
  onIncrement,
  onDecrement,
  onQuantity,
  onItemDiscount,
  onRemove,
}: {
  line: CartLine;
  machine: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onQuantity: (quantity: number) => void;
  onItemDiscount: (discountAmount: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className={cn("space-y-2 rounded-lg border border-border", machine ? "p-3" : "p-2")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{line.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(line.unitPrice)}
            {line.unit ? ` / ${line.unit}` : ""}
            {line.discountAmount > 0 ? ` · Disc ${formatCurrency(line.discountAmount)}` : ""}
          </p>
        </div>
        <p className="shrink-0 font-medium tabular-nums">{formatCurrency(lineNet(line))}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size={machine ? "icon-lg" : "icon-xs"}
            onClick={onDecrement}
            aria-label="Decrease quantity"
          >
            <Minus />
          </Button>
          <Input
            className={cn("text-center", machine ? "h-10 w-16" : "h-7 w-14")}
            type="number"
            min={1}
            value={line.quantity}
            onChange={(event) => onQuantity(Number(event.target.value) || 0)}
            aria-label={`Quantity for ${line.name}`}
          />
          <Button
            type="button"
            variant="outline"
            size={machine ? "icon-lg" : "icon-xs"}
            onClick={onIncrement}
            aria-label="Increase quantity"
          >
            <Plus />
          </Button>
        </div>
        <Input
          className={machine ? "h-10 w-28" : "h-7 w-24"}
          type="number"
          min={0}
          step="0.01"
          value={line.discountAmount || ""}
          onChange={(event) => onItemDiscount(Number(event.target.value) || 0)}
          aria-label={`Item discount for ${line.name}`}
          placeholder="Discount"
        />
        <Button
          type="button"
          variant="ghost"
          size={machine ? "default" : "icon-xs"}
          onClick={onRemove}
          aria-label={`Remove ${line.name}`}
        >
          <Trash2 />
          {machine ? "Remove" : null}
        </Button>
      </div>
    </li>
  );
}
