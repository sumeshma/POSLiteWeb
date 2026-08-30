import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters."),
  parentCategoryId: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  defaultShowOnPos: z.boolean(),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const emptyCategoryForm: CategoryFormValues = {
  name: "",
  parentCategoryId: "",
  description: "",
  imageUrl: "",
  defaultShowOnPos: true,
  isActive: true,
};
