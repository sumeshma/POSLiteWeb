import { Badge } from "@/components/ui/badge";

export function CreditStatusBadge({ status }: { status: string | null | undefined }) {
  const label = status?.trim() || "Unknown";
  const variant =
    label === "Paid" || label === "Posted"
      ? "default"
      : label === "Cancelled" || label === "Reversed"
        ? "destructive"
        : "outline";

  return <Badge variant={variant}>{label}</Badge>;
}
