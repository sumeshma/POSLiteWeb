import { z } from "zod";
import { PRODUCT_UNITS } from "@/types/product";

const requiredNumber = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)), message);

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters."),
  sku: z.string().trim().min(1, "SKU is required."),
  size: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  barcode: z.string(),
  quickCode: z
    .string()
    .trim()
    .refine((value) => value === "" || /^-?\d+$/.test(value), "Quick code must be a whole number."),
  categoryId: z.string().min(1, "Category is required."),
  unit: z.string().min(1, "Unit is required."),
  price: requiredNumber("Price is required."),
  costPrice: requiredNumber("Cost price is required."),
  stockQuantity: requiredNumber("Stock quantity is required."),
  reorderLevel: requiredNumber("Reorder level is required."),
  showOnPos: z.boolean(),
  hsnCode: z.string(),
  taxRatePercent: requiredNumber("Tax rate is required."),
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const emptyProductForm: ProductFormValues = {
  name: "",
  sku: "",
  size: "",
  description: "",
  imageUrl: "",
  barcode: "",
  quickCode: "",
  categoryId: "",
  unit: PRODUCT_UNITS[0],
  price: "0",
  costPrice: "0",
  stockQuantity: "0",
  reorderLevel: "0",
  showOnPos: true,
  hsnCode: "",
  taxRatePercent: "5",
  isActive: true,
};
