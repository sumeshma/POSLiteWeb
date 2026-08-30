import { env } from "@/config/env";
import {
  ApiError,
  type ApiErrorCode,
  type ApiResponse,
  type AuthTokenPair,
} from "@/types/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getShopCode,
  notifyUnauthorized,
  updateSessionTokens,
} from "@/lib/session";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  skipAuth?: boolean;
  skipShopCode?: boolean;
  shopCode?: string;
  skipRefresh?: boolean;
  unwrap?: boolean;
};

function joinUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function mapStatusToCode(status: number): ApiErrorCode {
  if (status === 0) {
    return "network";
  }
  if (status === 400) {
    return "validation";
  }
  if (status === 401) {
    return "unauthorized";
  }
  if (status === 403) {
    return "forbidden";
  }
  if (status === 404) {
    return "not_found";
  }
  if (status >= 500) {
    return "server";
  }
  return "unknown";
}

function fallbackMessage(status: number): string {
  if (status === 0) {
    return "Unable to connect. Please check your connection and try again.";
  }
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "The requested resource was not found.";
  }
  if (status >= 500) {
    return "The server is unavailable. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as ApiResponse<unknown>).success === "boolean"
  );
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function toApiError(status: number, payload: unknown): ApiError {
  if (isApiResponse(payload)) {
    return new ApiError({
      status,
      code: payload.success === false && status === 200 ? "business" : mapStatusToCode(status),
      message: payload.message || fallbackMessage(status),
      errors: payload.errors ?? [],
    });
  }

  if (typeof payload === "string" && payload.trim().length > 0) {
    return new ApiError({
      status,
      code: mapStatusToCode(status),
      message: fallbackMessage(status),
    });
  }

  return new ApiError({
    status,
    code: mapStatusToCode(status),
    message: fallbackMessage(status),
  });
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const tokens = await request<AuthTokenPair>("/api/auth/refresh", {
        method: "POST",
        body: { refreshToken },
        skipAuth: true,
        skipRefresh: true,
      });

      updateSessionTokens(tokens);
      return true;
    } catch {
      clearSession();
      notifyUnauthorized();
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    signal,
    skipAuth = false,
    skipShopCode = false,
    shopCode: shopCodeOverride,
    unwrap = true,
    skipRefresh = false,
  } = options;

  const requestHeaders = new Headers(headers);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData && body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const headerShopCode = shopCodeOverride ?? (skipShopCode ? null : getShopCode());
  if (headerShopCode) {
    requestHeaders.set("X-Shop-Code", headerShopCode);
  }

  let response: Response;

  try {
    response = await fetch(joinUrl(env.apiBaseUrl, path), {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      status: 0,
      code: "network",
      message: fallbackMessage(0),
    });
  }

  if (response.status === 401 && !skipRefresh && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, { ...options, skipRefresh: true });
    }

    throw toApiError(401, await parseBody(response).catch(() => null));
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }

  if (!unwrap) {
    return payload as T;
  }

  if (isApiResponse(payload)) {
    if (!payload.success) {
      throw toApiError(response.status, payload);
    }

    return payload.data as T;
  }

  return payload as T;
}

export const apiClient = {
  request,
  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "POST", body });
  },
  put<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "PUT", body });
  },
  patch<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },
  delete<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
