/**
 * Mock API errors carry a `code` (see MockApiError in the store). Components must not import the
 * store, so they detect "gone" records structurally through this helper.
 */
export function isNotFoundError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "not_found";
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Try again.") {
  return error instanceof Error ? error.message : fallback;
}
