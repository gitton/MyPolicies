export type GENERIC_ERROR_CODE = "UNKNOWN_ERROR";

export type Success<T> = { success: true; data: T };
export type Failure<E extends string> = {
  success: false;
  error: { code: E; details?: Record<string, string[]> };
};
export type Result<T, E extends string> = Success<T> | Failure<E>;
