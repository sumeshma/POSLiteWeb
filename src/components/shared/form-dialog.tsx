"use client";

import { useRef, useState, type ReactNode } from "react";
import { AlertTriangle, FilePenLine, Loader2, type LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
  isDirty: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: () => void;
  children: ReactNode;
  className?: string;
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon = FilePenLine,
  size = "md",
  isDirty,
  isSubmitting,
  submitLabel,
  onSubmit,
  children,
  className,
}: FormDialogProps) {
  const skipGuardRef = useRef(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails?: { cancel: () => void },
  ) {
    if (!nextOpen && (isDirty || isSubmitting) && !skipGuardRef.current) {
      eventDetails?.cancel();
      if (!isSubmitting) {
        setDiscardOpen(true);
      }
      return;
    }

    skipGuardRef.current = false;
    onOpenChange(nextOpen);
  }

  function confirmDiscard() {
    skipGuardRef.current = true;
    setDiscardOpen(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent size={size} className={className} showCloseButton>
          <DialogHeader icon={icon}>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <form
            className="flex min-h-0 flex-col overflow-hidden"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
            noValidate
          >
            <DialogBody className="space-y-4">{children}</DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you close now, those changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
