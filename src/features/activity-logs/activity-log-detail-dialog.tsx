"use client";

import { ScrollText } from "lucide-react";
import { ViewDialog } from "@/components/shared/view-dialog";
import { formatDateTime } from "@/lib/date";
import type { ActivityLog } from "@/types/activity-log";

type ActivityLogDetailDialogProps = {
  log: ActivityLog | null;
  onOpenChange: (open: boolean) => void;
};

export function ActivityLogDetailDialog({ log, onOpenChange }: ActivityLogDetailDialogProps) {
  return (
    <ViewDialog
      open={Boolean(log)}
      onOpenChange={onOpenChange}
      title="Activity details"
      description={log?.description || "Values returned by the activity log API."}
      icon={ScrollText}
    >
      {log ? (
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">When</dt>
            <dd>{formatDateTime(log.createdAt) || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">User</dt>
            <dd>{log.userName || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Module</dt>
            <dd>{log.module || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Action</dt>
            <dd>{log.actionType || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Entity</dt>
            <dd className="break-all">{log.entityId || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Previous values</dt>
            <dd className="whitespace-pre-wrap break-all">{log.oldValues || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">New values</dt>
            <dd className="whitespace-pre-wrap break-all">{log.newValues || "—"}</dd>
          </div>
        </dl>
      ) : null}
    </ViewDialog>
  );
}
