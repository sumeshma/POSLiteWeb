import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required."),
  contactPerson: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  address: z.string(),
  isActive: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export const emptySupplierForm: SupplierFormValues = {
  name: "",
  contactPerson: "",
  phoneNumber: "",
  email: "",
  address: "",
  isActive: true,
};
