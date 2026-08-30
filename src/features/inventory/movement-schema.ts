import { z } from "zod";
import { WRITABLE_MOVEMENT_TYPES } from "@/types/inventory";

export const stockMovementFormSchema = z
  .object({
    productId: z.string().min(1, "Product is required."),
    movementType: z.enum(WRITABLE_MOVEMENT_TYPES, {
      error: "Movement type must be StockIn, StockOut, or Adjustment.",
    }),
    quantity: z.string().trim(),
    newQuantity: z.string().trim(),
    reason: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.movementType === "Adjustment") {
      if (values.newQuantity === "" || !Number.isFinite(Number(values.newQuantity))) {
        ctx.addIssue({
          code: "custom",
          path: ["newQuantity"],
          message: "New quantity is required for adjustments.",
        });
        return;
      }
      if (Number(values.newQuantity) < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["newQuantity"],
          message: "New quantity cannot be negative.",
        });
      }
      return;
    }

    if (values.quantity === "" || !Number.isFinite(Number(values.quantity))) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantity must be greater than zero.",
      });
      return;
    }
    if (Number(values.quantity) <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantity must be greater than zero.",
      });
    }
  });

export type StockMovementFormValues = z.infer<typeof stockMovementFormSchema>;

export const emptyStockMovementForm: StockMovementFormValues = {
  productId: "",
  movementType: "StockIn",
  quantity: "1",
  newQuantity: "",
  reason: "",
};
