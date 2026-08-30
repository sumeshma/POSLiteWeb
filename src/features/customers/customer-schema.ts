import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().trim().min(2, "Customer name must be at least 2 characters."),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone must be a valid 10-digit mobile number."),
  email: z.string(),
  isActive: z.boolean(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const emptyCustomerForm: CustomerFormValues = {
  name: "",
  phone: "",
  email: "",
  isActive: true,
};
