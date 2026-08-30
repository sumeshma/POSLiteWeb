"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  LayoutTemplate,
  Loader2,
  Palette,
  Server,
  ShieldOff,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { LocalLoading } from "@/components/shared/local-loading";
import { PageLoading } from "@/components/shared/page-loading";
import { PermissionDeniedState } from "@/components/shared/permission-denied-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryKeys } from "@/config/query-keys";
import { env } from "@/config/env";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { getErrorMessage } from "@/types/api";
import { getHealth } from "@/services/health.service";
import { useAuth } from "@/components/auth/auth-provider";
import { getUserDisplayName } from "@/types/auth";

type PreviewState = "loading" | "empty" | "error" | "permission" | "page" | "local";

export function FoundationPage() {
  const [preview, setPreview] = useState<PreviewState>("empty");
  const [dialogOpen, setDialogOpen] = useState(false);
  const sampleDate = new Date("2026-08-28T10:30:00");
  const { user, session } = useAuth();

  const healthQuery = useQuery({
    queryKey: queryKeys.health(),
    queryFn: ({ signal }) => getHealth(signal),
    enabled: false,
    retry: false,
  });

  return (
    <PageContainer>
      <Alert>
        <AlertTriangle className="size-4" />
        <AlertTitle>Development placeholder</AlertTitle>
        <AlertDescription>
          This page exists only to validate the application foundation and authentication.
          It is not a business dashboard. POS and other business modules are not implemented
          yet. Use the color tab on the right edge to switch themes.
        </AlertDescription>
      </Alert>

      <PageHeader
        title="Home"
        icon={LayoutTemplate}
        description={`Signed in as ${getUserDisplayName(user)}${session?.shopDisplayName ? ` · ${session.shopDisplayName}` : session?.shopCode ? ` · ${session.shopCode}` : ""}.`}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={LayoutTemplate}
          title="Application shell"
          description="Sidebar, header, and content area are ready for future authenticated pages."
        />
        <StatusCard
          icon={Palette}
          title="Theme"
          description="Typography, spacing, color tokens, and radius are centralized."
        />
        <StatusCard
          icon={CheckCircle2}
          title="Shared states"
          description="Loading, empty, error, and permission-denied patterns are reusable."
        />
        <StatusCard
          icon={Server}
          title="API client"
          description="One HTTP client with environment-based base URL, headers, and error handling."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shared application states</CardTitle>
            <CardDescription>
              Preview the reusable states future modules should use. These are not live
              business results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["empty", "Empty"],
                  ["loading", "Loading"],
                  ["error", "Error"],
                  ["permission", "Permission"],
                  ["page", "Page loading"],
                  ["local", "Local loading"],
                ] as const
              ).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={preview === key ? "default" : "outline"}
                  onClick={() => setPreview(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="min-h-56 rounded-lg border bg-muted/20">
              {preview === "empty" ? (
                <EmptyState
                  title="No records yet"
                  description="This is a development empty state. Future modules can pass a real action here."
                />
              ) : null}
              {preview === "loading" ? <LoadingState label="Loading sample state..." /> : null}
              {preview === "error" ? (
                <ErrorState
                  title="Unable to load sample data"
                  description="This is a development error state. Retry is only a local preview."
                  onRetry={() => setPreview("loading")}
                />
              ) : null}
              {preview === "permission" ? (
                <PermissionDeniedState
                  title="Permission denied"
                  description="This is a development permission state for future 403 handling."
                />
              ) : null}
              {preview === "page" ? (
                <div className="p-4">
                  <PageLoading />
                </div>
              ) : null}
              {preview === "local" ? (
                <LocalLoading loading className="min-h-56 p-4">
                  <p className="text-sm text-muted-foreground">
                    Local overlay loading does not block the rest of the application.
                  </p>
                </LocalLoading>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared components</CardTitle>
            <CardDescription>
              Foundation controls from shadcn/ui. These are previews, not product
              workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Button type="button">Primary</Button>
              <Button type="button" variant="secondary">
                Secondary
              </Button>
              <Button type="button" variant="outline">
                Outline
              </Button>
              <Button type="button" variant="destructive">
                Destructive
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dev-sample-input">Sample input</Label>
              <Input id="dev-sample-input" placeholder="Development only" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
                Open sample dialog
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.success("Development toast preview")}
              >
                Show sample toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Display formatters</CardTitle>
            <CardDescription>
              Centralized currency, number, and date formatting. API values stay separate
              from display output.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{formatCurrency(1299.5)}</dd>
              <dt className="text-muted-foreground">Number</dt>
              <dd>{formatNumber(128450.75)}</dd>
              <dt className="text-muted-foreground">Percent</dt>
              <dd>{formatPercent(0.18)}</dd>
              <dt className="text-muted-foreground">Date</dt>
              <dd>{formatDate(sampleDate)}</dd>
              <dt className="text-muted-foreground">Date and time</dt>
              <dd>{formatDateTime(sampleDate)}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API foundation check</CardTitle>
            <CardDescription>
              Optional request to the configured development API health endpoint. This
              does not call business modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm break-all text-muted-foreground">{env.apiBaseUrl}</p>
            <Button
              type="button"
              onClick={() => {
                void healthQuery.refetch();
              }}
              disabled={healthQuery.isFetching}
            >
              {healthQuery.isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check API health"
              )}
            </Button>
            {healthQuery.isSuccess ? (
              <Alert>
                <CheckCircle2 className="size-4" />
                <AlertTitle>API reachable</AlertTitle>
                <AlertDescription>
                  {healthQuery.data.status} — {healthQuery.data.service} (
                  {healthQuery.data.environment})
                </AlertDescription>
              </Alert>
            ) : null}
            {healthQuery.isError ? (
              <Alert variant="destructive">
                <ShieldOff className="size-4" />
                <AlertTitle>API check failed</AlertTitle>
                <AlertDescription>{getErrorMessage(healthQuery.error)}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader icon={LayoutTemplate}>
            <DialogTitle>Sample dialog</DialogTitle>
            <DialogDescription>
              Development preview only. No business action is performed.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-muted-foreground">
              Use this preview to check header, scrolling body, and footer layout.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function StatusCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof LayoutTemplate;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex size-9 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
