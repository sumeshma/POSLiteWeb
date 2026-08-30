import { format, isValid, parseISO } from "date-fns";

const DISPLAY_DATE = "dd MMM yyyy";
const DISPLAY_DATE_TIME = "dd MMM yyyy, hh:mm a";
const DISPLAY_TIME = "hh:mm a";
const API_DATE = "yyyy-MM-dd";

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : typeof value === "number" ? new Date(value) : parseISO(value);

  return isValid(date) ? date : null;
}

export function formatDate(value: Date | string | number | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, DISPLAY_DATE) : "";
}

export function formatDateTime(value: Date | string | number | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, DISPLAY_DATE_TIME) : "";
}

export function formatTime(value: Date | string | number | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, DISPLAY_TIME) : "";
}

/** Convert a Date to an API date string (yyyy-MM-dd). */
export function toApiDate(value: Date): string {
  return format(value, API_DATE);
}

/** Start of a `yyyy-MM-dd` calendar day as an ISO timestamp (UTC). */
export function toStartOfDayIso(dateYmd: string | null | undefined): string | undefined {
  if (!dateYmd) {
    return undefined;
  }
  return `${dateYmd}T00:00:00.000Z`;
}

/** End of a `yyyy-MM-dd` calendar day as an ISO timestamp (UTC). */
export function toEndOfDayIso(dateYmd: string | null | undefined): string | undefined {
  if (!dateYmd) {
    return undefined;
  }
  return `${dateYmd}T23:59:59.999Z`;
}
