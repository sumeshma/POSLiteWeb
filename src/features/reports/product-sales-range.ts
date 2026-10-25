import { differenceInCalendarDays, isValid, parseISO } from "date-fns";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;
const MAX_SPAN_DAYS = 366;

export function productSalesRangeError(fromDate: string, toDate: string): string | null {
  if (!fromDate || !toDate) {
    return "Choose both a start date and an end date.";
  }

  const from = parseISO(fromDate);
  const to = parseISO(toDate);
  if (!isValid(from) || !isValid(to)) {
    return "Enter valid dates.";
  }

  const fromYear = from.getFullYear();
  const toYear = to.getFullYear();
  if (fromYear < MIN_YEAR || fromYear > MAX_YEAR || toYear < MIN_YEAR || toYear > MAX_YEAR) {
    return "Dates must fall between 2000 and 2100.";
  }

  if (to < from) {
    return "The end date must be on or after the start date.";
  }

  const span = differenceInCalendarDays(to, from) + 1;
  if (span > MAX_SPAN_DAYS) {
    return "The range can be at most 366 days.";
  }

  return null;
}

export function parseProductSalesLimit(raw: string): { value?: number; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { error: null };
  }

  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 1 || value > 500) {
    return { error: "Limit must be a whole number from 1 to 500, or leave it empty for every product." };
  }

  return { value, error: null };
}
