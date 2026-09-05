export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isPublicAuthPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/login" || path === "/sso/callback";
}

export function getBrowserPathname(fallback = ""): string {
  if (typeof window !== "undefined") {
    return window.location.pathname;
  }
  return fallback;
}
