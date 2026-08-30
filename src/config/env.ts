function requireApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local.",
    );
  }

  return value.replace(/\/$/, "");
}

export const env = {
  get apiBaseUrl(): string {
    return requireApiBaseUrl();
  },
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
};
