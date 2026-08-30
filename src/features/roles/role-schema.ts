import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().trim().min(1, "Role name is required."),
  description: z.string(),
  isActive: z.boolean(),
  permissions: z.array(z.string()),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const emptyRoleForm: RoleFormValues = {
  name: "",
  description: "",
  isActive: true,
  permissions: [],
};
