import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/api";

function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404)) {
    return false;
  }
  return failureCount < 1;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
