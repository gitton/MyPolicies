import { getCurrentUser } from "@/features/auth/getCurrentUser";
import type { PolicyType } from "@/types/PolicyType";
import { getEndOfDay } from "@/utils/getEndOfDay";
import { getStartOfDay } from "@/utils/getStartOfDay";
import { policySchema } from "@/validation/policySchema";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { Failure, GENERIC_ERROR_CODE, Result, Success } from "../Result";
import { getPoliciesCollectionReference } from "./firestore/getCollectionReference";
import { getUniqueId } from "./firestore/getUniqueId";

/**
 * Error codes that can be returned by the `savePolicy` function.
 */
export type POLICY_SAVE_ERROR_CODE =
  | GENERIC_ERROR_CODE
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR";

/**
 * Saves a new policy or updates an existing policy to Firestore for the currently authenticated user.
 * If an `id` is provided, the policy with that ID will be updated. Otherwise, a new policy will be created.
 *
 * @param policy The policy object to be saved. Must conform to `PolicyType`.
 * @param policyId Optional. The ID of the policy to update. If not provided, a new policy will be created.
 * @returns A Promise that resolves to a `Success<string>` containing the policy ID on success,
 *          or a `Failure<POLICY_SAVE_ERROR_CODE>` on failure.
 *          - `UNAUTHENTICATED`: If no user is currently authenticated.
 *          - `VALIDATION_ERROR`: If the policy data fails schema validation. The `error.details` property
 *                              will contain a `Record<string, string[]>` with field-specific validation messages.
 *          - `FIRESTORE_ERROR`: If an error occurs during the Firestore save operation.
 */
export const savePolicy = async (
  policy: PolicyType,
  policyId?: string
): Promise<Result<string, POLICY_SAVE_ERROR_CODE>> => {
  // Check if user is authenticated
  const user = getCurrentUser();
  if (!user) {
    return createFailureResult("UNAUTHENTICATED");
  }

  // Validate id if provided
  if (policyId !== undefined) {
    if (!policyId.trim()) {
      return createFailureResult("VALIDATION_ERROR", {
        policyId: ["Invalid policy id to update"],
      });
    }
  }

  // Normalize dates: start date to beginning of day, end date to end of day in the local timezone
  const normalizedPolicy = {
    ...policy,
    startDate: getStartOfDay(policy.startDate),
    endDate: getEndOfDay(policy.endDate),
  };

  // Validate policy form data using schema
  const validationResult = policySchema.safeParse(normalizedPolicy);

  if (!validationResult.success) {
    const errors = validationResult.error.flatten();
    return createFailureResult("VALIDATION_ERROR", errors.fieldErrors);
  }

  try {
    const policiesCollectionRef = getPoliciesCollectionReference(user.id);
    const now = serverTimestamp();

    //If policy id is provided, update the policy otherwise create a new policy
    if (policyId === undefined) {
      //create a new policy
      const newPolicyId = getUniqueId(policiesCollectionRef.doc());
      const documentReference = policiesCollectionRef.doc(newPolicyId);
      await documentReference.set({
        ...validationResult.data,
        createdAt: now,
        updatedAt: now,
      });
      //return the success result
      return createSuccessResult(newPolicyId);
    } else {
      const documentReference = policiesCollectionRef.doc(policyId);
      await documentReference.update({
        ...validationResult.data,
        updatedAt: now,
      });
      //return the success result
      return createSuccessResult(policyId);
    }
  } catch (error) {
    // console.error("Failed to save policy:", error);
    return createFailureResult("UNKNOWN_ERROR");
  }
};

/**
 * Creates a standardized failure result object.
 *
 * @template T The type of the error code.
 * @param code The specific `POLICY_SAVE_ERROR_CODE` for the failure.
 * @param details An optional object containing field-specific validation messages, typically used with `VALIDATION_ERROR`.
 * @returns A `Failure` object with the specified error code and optional details.
 */
const createFailureResult = <T extends POLICY_SAVE_ERROR_CODE>(
  code: T,
  details?: Record<string, string[]>
): Failure<T> => ({ success: false, error: { code, details } });

const createSuccessResult = (policyId: string): Success<string> => ({
  success: true,
  data: policyId,
});
