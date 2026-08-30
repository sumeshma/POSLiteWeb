"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DataTableAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "ghost" | "destructive";
  disabled?: boolean;
};

export function DataTableActions({ actions }: { actions: DataTableAction[] }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {actions.map((action) => {
        const isEdit = action.label.toLowerCase() === "edit";

        return (
          <Button
            key={action.label}
            type="button"
            variant={action.variant === "destructive" ? "destructive" : "ghost"}
            size="icon-sm"
            aria-label={action.label}
            disabled={action.disabled}
            onClick={action.onClick}
            className={cn(
              isEdit &&
                "text-brand-secondary hover:bg-brand-secondary-soft hover:text-brand-secondary",
            )}
          >
            <action.icon />
          </Button>
        );
      })}
    </div>
  );
}
