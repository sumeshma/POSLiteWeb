import type { Metadata } from "next";
import { ShopDetailsPage } from "@/features/shop/shop-details-page";

export const metadata: Metadata = {
  title: "Shop details",
};

export default function ShopRoute() {
  return <ShopDetailsPage />;
}
