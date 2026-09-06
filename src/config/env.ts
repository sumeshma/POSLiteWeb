function requireApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local.",
    );
  }

  return value.replace(/\/$/, "");
}

function readAuralizzHomeUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_AURALIZZ_HOME_URL?.trim();
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export const env = {
  get apiBaseUrl(): string {
    return requireApiBaseUrl();
  },
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  auralizzHomeUrl: readAuralizzHomeUrl(),
};
