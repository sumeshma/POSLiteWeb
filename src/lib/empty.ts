export function emptyToNull(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function emptyToUndefined(value: string | null | undefined): string | undefined {
  const normalized = emptyToNull(value);
  return normalized ?? undefined;
}
