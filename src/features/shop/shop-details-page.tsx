"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { ImageField } from "@/components/shared/image-field";
import { LoadingState } from "@/components/shared/loading-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { permissions } from "@/config/permissions";
import { emptyToNull } from "@/lib/empty";
import { resolveMediaUrl } from "@/lib/media";
import { getMutationErrorMessage, isValidationError } from "@/lib/mutation-errors";
import { resolveShopDisplayName, updateSessionShopProfile } from "@/lib/session";
import { getErrorMessage } from "@/types/api";
import { uploadBrandingImage } from "@/services/files.service";
import type { ShopSettings } from "@/types/billing";
import {
  emptyShopSettingsForm,
  shopSettingsFormSchema,
  type ShopSettingsFormValues,
} from "./shop-schema";
import { useShopSettingsMutations, useShopSettingsQuery, useUiPickupsQuery } from "./use-shop-settings";

function toFormValues(settings: ShopSettings): ShopSettingsFormValues {
  return {
    businessName: settings.businessName ?? "",
    appDisplayName: settings.appDisplayName ?? "",
    logoImageUrl: settings.logoImageUrl ?? "",
    gstin: settings.gstin ?? "",
    address: settings.address ?? "",
    phoneNumber: settings.phoneNumber ?? "",
    selectedUiPickupId: String(settings.selectedUiPickupId ?? 0),
    allowSellWhenOutOfStock: settings.allowSellWhenOutOfStock,
    isGstEnabled: settings.isGstEnabled,
  };
}

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function ShopDetailsPage() {
  const { can, session } = useAuth();
  const canEdit = can(permissions.settingsShop);
  const settingsQuery = useShopSettingsQuery();
  const pickupsQuery = useUiPickupsQuery({ enabled: canEdit });
  const mutations = useShopSettingsMutations();
  const form = useForm<ShopSettingsFormValues>({
    resolver: zodResolver(shopSettingsFormSchema),
    defaultValues: emptyShopSettingsForm,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(toFormValues(settingsQuery.data));
    }
  }, [form, settingsQuery.data]);

  async function onSubmit(values: ShopSettingsFormValues) {
    try {
      const updated = await mutations.update.mutateAsync({
        businessName: emptyToNull(values.businessName),
        appDisplayName: emptyToNull(values.appDisplayName),
        logoImageUrl: emptyToNull(values.logoImageUrl),
        gstin: emptyToNull(values.gstin),
        address: emptyToNull(values.address),
        phoneNumber: emptyToNull(values.phoneNumber),
        selectedUiPickupId: Number(values.selectedUiPickupId) || 0,
        allowSellWhenOutOfStock: values.allowSellWhenOutOfStock,
        isGstEnabled: values.isGstEnabled,
      });
      const shopCode = session?.shopCode ?? "";
      updateSessionShopProfile(
        resolveShopDisplayName(shopCode, updated.appDisplayName, updated.businessName),
      );
      toast.success("Shop details saved.");
      form.reset(toFormValues(updated));
    } catch (error) {
      form.setError("root", { message: getMutationErrorMessage(error) });
      if (!isValidationError(error)) {
        toast.error("Unable to save shop details.");
      }
    }
  }

  const settings = settingsQuery.data;
  const pickups = pickupsQuery.data ?? [];
  const logoUrl = resolveMediaUrl(settings?.logoImageUrl);
  const shopCode = session?.shopCode ?? "";

  return (
    <PageContainer>
      <PageHeader
        title="Shop details"
        description="Name, logo, and contact details used on bills and in the header."
        icon={Store}
      />

      {settingsQuery.isLoading ? (
        <LoadingState label="Loading shop details..." />
      ) : settingsQuery.isError ? (
        <ErrorState
          title="Unable to load shop details"
          description={getErrorMessage(settingsQuery.error)}
          onRetry={() => void settingsQuery.refetch()}
        />
      ) : !settings ? (
        <EmptyState title="Shop details are not available" />
      ) : !canEdit ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          <ShopDetail label="Shop code" value={shopCode || "—"} />
          <ShopDetail label="Business name" value={displayValue(settings.businessName)} />
          <ShopDetail label="Display name" value={displayValue(settings.appDisplayName)} />
          <ShopDetail label="Phone" value={displayValue(settings.phoneNumber)} />
          <ShopDetail label="GSTIN" value={displayValue(settings.gstin)} />
          <ShopDetail
            label="Receipt style"
            value={displayValue(settings.selectedUiPickupName)}
          />
          <ShopDetail
            label="Sell when out of stock"
            value={settings.allowSellWhenOutOfStock ? "Allowed" : "Blocked"}
          />
          <ShopDetail label="GST on bills" value={settings.isGstEnabled ? "Enabled" : "Disabled"} />
          <div className="space-y-1 sm:col-span-2">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Address
            </dt>
            <dd className="text-sm">{displayValue(settings.address)}</dd>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Logo
            </dt>
            <dd>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover ring-1 ring-border"
                />
              ) : (
                <span className="text-sm text-muted-foreground">No logo uploaded</span>
              )}
            </dd>
          </div>
        </dl>
      ) : (
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Shop code">
              <Input value={shopCode} disabled readOnly />
            </FormField>
            <FormField label="Business name" htmlFor="shop-business-name">
              <Input
                id="shop-business-name"
                disabled={mutations.update.isPending}
                {...form.register("businessName")}
              />
            </FormField>
            <FormField
              label="Display name"
              htmlFor="shop-display-name"
              description="Shown in the header and on printed bills."
            >
              <Input
                id="shop-display-name"
                disabled={mutations.update.isPending}
                {...form.register("appDisplayName")}
              />
            </FormField>
            <FormField label="Phone" htmlFor="shop-phone">
              <Input
                id="shop-phone"
                disabled={mutations.update.isPending}
                {...form.register("phoneNumber")}
              />
            </FormField>
            <FormField label="GSTIN" htmlFor="shop-gstin">
              <Input
                id="shop-gstin"
                disabled={mutations.update.isPending}
                {...form.register("gstin")}
              />
            </FormField>
            {pickups.length > 0 ? (
              <FormField label="Receipt style">
                <Controller
                  control={form.control}
                  name="selectedUiPickupId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mutations.update.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a receipt style" />
                      </SelectTrigger>
                      <SelectContent>
                        {pickups.map((pickup) => (
                          <SelectItem key={pickup.id} value={String(pickup.id)}>
                            {pickup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            ) : null}
            <FormField label="Address" htmlFor="shop-address" className="sm:col-span-2">
              <Textarea
                id="shop-address"
                disabled={mutations.update.isPending}
                {...form.register("address")}
              />
            </FormField>
            <FormField
              label="Shop logo"
              className="sm:col-span-2"
              description="Uploads to the branding folder. JPEG, PNG, WebP, or GIF."
            >
              <Controller
                control={form.control}
                name="logoImageUrl"
                render={({ field }) => (
                  <ImageField
                    value={field.value || null}
                    onChange={(value) => field.onChange(value ?? "")}
                    disabled={mutations.update.isPending}
                    uploadFile={uploadBrandingImage}
                  />
                )}
              />
            </FormField>
            <FormField label="Sell when out of stock">
              <Controller
                control={form.control}
                name="allowSellWhenOutOfStock"
                render={({ field }) => (
                  <div className="flex h-8 items-center">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={mutations.update.isPending}
                    />
                  </div>
                )}
              />
            </FormField>
            <FormField label="GST on bills">
              <Controller
                control={form.control}
                name="isGstEnabled"
                render={({ field }) => (
                  <div className="flex h-8 items-center">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={mutations.update.isPending}
                    />
                  </div>
                )}
              />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutations.update.isPending || !form.formState.isDirty}>
              {mutations.update.isPending ? "Saving..." : "Save shop details"}
            </Button>
          </div>
        </form>
      )}
    </PageContainer>
  );
}

function ShopDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
