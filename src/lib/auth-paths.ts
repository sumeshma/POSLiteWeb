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

/** Safe in-app path from a `from` query, or home. */
export function getPostLoginPath(from: string | null | undefined): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return "/";
}

/**
 * Static export uses trailingSlash. Keep query/hash, add a trailing slash
 * so Azure/SWA serves the real HTML file instead of a client-router miss.
 */
export function toStaticHref(path: string): string {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf("?");
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const normalized = normalizePathname(pathname || "/");
  const href = normalized === "/" ? "/" : `${normalized}/`;
  return `${href}${search}${hash}`;
}

/** Full document load. Client `router.replace` after login leaves a blank page. */
export function hardNavigate(path: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.location.replace(toStaticHref(path));
}
