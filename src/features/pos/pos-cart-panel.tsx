"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus, Trash2, UserRound } from "lucide-react";
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

  const itemCount = cart.lines.length;
  const itemCountLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex shrink-0 items-center gap-2 border-b p-3">
        <UserRound className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", machine && "text-base")}>
            {customerLabel(cart.customer)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {cart.heldOrderId ? "Resumed hold" : "New sale"}
            {itemCount > 0 ? ` · ${itemCountLabel}` : ""}
            {cart.customer?.phone ? ` · ${cart.customer.phone}` : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size={machine ? "default" : "sm"}
          onClick={onSelectCustomer}
        >
          {cart.customer ? "Change" : "Customer"}
        </Button>
        {cart.customer ? (
          <Button
            type="button"
            variant="ghost"
            size={machine ? "default" : "sm"}
            onClick={onClearCustomer}
          >
            Walk-in
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size={machine ? "lg" : "sm"}
          onClick={onHeldOrders}
        >
          Holds{holdCount > 0 ? ` (${holdCount})` : ""}
        </Button>
      </div>

      <div className="min-h-[8rem] flex-1 overflow-y-auto">
        {itemCount === 0 ? (
          <EmptyState
            className="py-8"
            title="Cart is empty"
            description="Search or tap a product to add it to the bill."
          />
        ) : (
          <ul className={cn("p-3", machine ? "space-y-2.5" : "space-y-2")}>
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

      <div className="shrink-0 space-y-1.5 border-t bg-card px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="pos-order-type" className="text-xs">
              Type
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
          <div className="space-y-1">
            <Label htmlFor="pos-discount" className="text-xs">
              Discount
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

        <dl className="space-y-0.5 text-sm">
          {totals.discountAmount > 0 || totals.packagingCharge > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(totals.subTotal)}</dd>
            </div>
          ) : null}
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
          <div className={cn("flex justify-between font-semibold", machine ? "text-lg" : "text-sm")}>
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(totals.totalAmount)}</dd>
          </div>
        </dl>
        {gstEnabled ? (
          <p className="text-xs text-muted-foreground">
            Tax is calculated by the server at checkout.
          </p>
        ) : null}

        <div className="grid grid-cols-[minmax(4.25rem,5.25rem)_minmax(0,1fr)] gap-1.5">
          <div className="grid grid-rows-2 gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-full"
              onClick={onClear}
              disabled={cart.lines.length === 0}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-full"
              onClick={onHold}
              disabled={cart.lines.length === 0 || submitting}
            >
              Hold
            </Button>
          </div>
          <Button
            type="button"
            className={cn(
              "h-full! min-h-[3.5rem] text-sm font-semibold",
              machine && "min-h-[3.75rem]",
            )}
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
  const [open, setOpen] = useState(false);
  const detailsId = `pos-line-${line.productId}`;

  return (
    <li className={cn("rounded-lg border border-border bg-muted/30", machine ? "p-2.5" : "p-2")}>
      <div className="flex items-start gap-1">
        <button
          type="button"
          className="min-w-0 flex-1 rounded-md text-left"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={detailsId}
        >
          <span className="flex items-start gap-1.5">
            <ChevronDown
              className={cn(
                "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block leading-tight font-medium">{line.name}</span>
              <span className="block text-xs leading-tight text-muted-foreground">
                {line.quantity} × {formatCurrency(line.unitPrice)}
                {line.unit ? ` / ${line.unit}` : ""}
                {line.discountAmount > 0 ? ` · Disc ${formatCurrency(line.discountAmount)}` : ""}
              </span>
            </span>
            <span className="shrink-0 font-medium tabular-nums">{formatCurrency(lineNet(line))}</span>
          </span>
        </button>
        <Button
          type="button"
          variant="ghost"
          size={machine ? "icon-lg" : "icon-xs"}
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove ${line.name}`}
        >
          <Trash2 />
        </Button>
      </div>
      {open ? (
        <div id={detailsId} className="mt-2 ml-5 flex flex-wrap items-center gap-2">
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
        </div>
      ) : null}
    </li>
  );
}
