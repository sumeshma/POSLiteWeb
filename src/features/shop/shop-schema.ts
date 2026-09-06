import { z } from "zod";

export const shopSettingsFormSchema = z.object({
  businessName: z.string(),
  appDisplayName: z.string(),
  logoImageUrl: z.string(),
  gstin: z.string(),
  address: z.string(),
  phoneNumber: z.string(),
  selectedUiPickupId: z.string(),
  allowSellWhenOutOfStock: z.boolean(),
  isGstEnabled: z.boolean(),
});

export type ShopSettingsFormValues = z.infer<typeof shopSettingsFormSchema>;

export const emptyShopSettingsForm: ShopSettingsFormValues = {
  businessName: "",
  appDisplayName: "",
  logoImageUrl: "",
  gstin: "",
  address: "",
  phoneNumber: "",
  selectedUiPickupId: "0",
  allowSellWhenOutOfStock: false,
  isGstEnabled: false,
};
