import { z } from "zod";

export const loginSchema = z.object({
  shopCode: z.string().trim().min(1, "Shop code is required."),
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
