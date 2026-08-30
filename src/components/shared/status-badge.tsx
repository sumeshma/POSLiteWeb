"use client";

import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusBadgeProps) {
  if (active) {
    return (
      <Badge className="border-transparent bg-success/15 text-success">
        {activeLabel}
      </Badge>
    );
  }

  return <Badge variant="outline">{inactiveLabel}</Badge>;
}
