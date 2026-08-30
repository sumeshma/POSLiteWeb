"use client";

import { useMemo } from "react";
import type { PermissionDefinition } from "@/types/user";

type PermissionChecklistProps = {
  catalog: PermissionDefinition[];
  value: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
};

function groupPermissions(catalog: PermissionDefinition[]) {
  const groups = new Map<string, PermissionDefinition[]>();

  for (const item of catalog) {
    if (!item.key) {
      continue;
    }
    const group = item.group?.trim() || "Other";
    const existing = groups.get(group) ?? [];
    existing.push(item);
    groups.set(group, existing);
  }

  return [...groups.entries()];
}

export function PermissionChecklist({
  catalog,
  value,
  onChange,
  disabled = false,
}: PermissionChecklistProps) {
  const groups = useMemo(() => groupPermissions(catalog), [catalog]);
  const selected = useMemo(() => new Set(value), [value]);

  function toggle(key: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    onChange([...next]);
  }

  function toggleGroup(keys: string[], checked: boolean) {
    const next = new Set(selected);
    for (const key of keys) {
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
    }
    onChange([...next]);
  }

  if (catalog.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No permission catalog is available.</p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map(([group, items]) => {
        const keys = items.map((item) => item.key!).filter(Boolean);
        const allChecked = keys.every((key) => selected.has(key));
        const groupId = `perm-group-${group.replace(/\s+/g, "-").toLowerCase()}`;

        return (
          <fieldset key={group} className="space-y-2 rounded-lg border border-border p-3">
            <legend className="px-1 text-sm font-medium">{group}</legend>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                id={groupId}
                type="checkbox"
                className="size-4 accent-primary"
                checked={allChecked}
                disabled={disabled}
                onChange={(event) => toggleGroup(keys, event.target.checked)}
              />
              Select all in this group
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => {
                const key = item.key!;
                const inputId = `perm-${key.replace(/\./g, "-")}`;
                return (
                  <label key={key} htmlFor={inputId} className="flex items-start gap-2 text-sm">
                    <input
                      id={inputId}
                      type="checkbox"
                      className="mt-0.5 size-4 accent-primary"
                      checked={selected.has(key)}
                      disabled={disabled}
                      onChange={(event) => toggle(key, event.target.checked)}
                    />
                    <span>
                      <span className="block">{item.label || key}</span>
                      <span className="block text-xs text-muted-foreground">{key}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
