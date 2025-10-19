import { POLICY_SAVE_ERROR_CODE } from "@/features/data/savePolicy";

export type PolicySaveError = {
  code: POLICY_SAVE_ERROR_CODE;
  details?: Record<string, string[]>;
};

export function isPolicySaveError(e: unknown): e is PolicySaveError {
  return (
    !!e &&
    typeof e === "object" &&
    "code" in e &&
    typeof (e as any).code === "string"
  );
}
