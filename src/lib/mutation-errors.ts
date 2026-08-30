import { ApiError, getErrorMessage } from "@/types/api";

export function getMutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.errors.length > 0) {
    return error.errors.join(" ");
  }

  return getErrorMessage(error);
}

export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "validation";
}
