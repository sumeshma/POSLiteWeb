import { z } from "zod";

export const userFormSchema = z
  .object({
    username: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    role: z.string().trim().min(1, "Identity role is required."),
    appRoleId: z.string(),
    isActive: z.boolean(),
    permissions: z.array(z.string()),
    shiftEnabled: z.boolean(),
    shiftStartTime: z.string(),
    shiftEndTime: z.string(),
    workingDays: z.string(),
    graceBeforeLoginMinutes: z.string(),
    graceAfterShiftMinutes: z.string(),
    allowLoginOutsideShift: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Enter a valid email address.",
      });
    }
  });

export type UserFormValues = z.infer<typeof userFormSchema>;

export const emptyUserForm: UserFormValues = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "Employee",
  appRoleId: "",
  isActive: true,
  permissions: [],
  shiftEnabled: false,
  shiftStartTime: "",
  shiftEndTime: "",
  workingDays: "",
  graceBeforeLoginMinutes: "0",
  graceAfterShiftMinutes: "0",
  allowLoginOutsideShift: false,
};

export const createUserFormSchema = userFormSchema.superRefine((values, ctx) => {
  if (!values.username.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["username"],
      message: "Username is required.",
    });
  }
  if (!values.password) {
    ctx.addIssue({
      code: "custom",
      path: ["password"],
      message: "Password is required.",
    });
  }
  if (values.password !== values.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(1, "New password is required."),
    confirmPassword: z.string().min(1, "Confirm the new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
