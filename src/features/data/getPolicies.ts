import { getCurrentUser } from "@/features/auth/getCurrentUser";
import type { FirestorePolicyType } from "@/types/FirestorePolicyType";
import type { PolicyWithId } from "@/types/PolicyTypeWithId";
import { convertFirestorePolicyToPolicy } from "@/utils/convertFirestorePolicyToPolicy";
import { Failure, GENERIC_ERROR_CODE, Result, Success } from "../Result";
import { getPoliciesCollectionReference } from "./firestore/getCollectionReference";

/**
 * Error codes that can be returned by the `getPolicies` function.
 */
export type POLICY_GET_ERROR_CODE = GENERIC_ERROR_CODE | "UNAUTHENTICATED";

/**
 * Retrieves all policies from Firestore for the currently authenticated user.
 *
 * @returns A Promise that resolves to a `Success<PolicyWithId[]>` containing an array of policies on success,
 *          or a `Failure<POLICY_GET_ERROR_CODE>` on failure.
 *          - `UNAUTHENTICATED`: If no user is currently authenticated.
 *          - `UNKNOWN_ERROR`: If an error occurs during the Firestore get operation.
 */
export const getPolicies = async (): Promise<
  Result<PolicyWithId[], POLICY_GET_ERROR_CODE>
> => {
  // Check if user is authenticated
  const user = getCurrentUser();
  if (!user) {
    return createFailureResult("UNAUTHENTICATED");
  }

  try {
    const policiesCollectionRef = getPoliciesCollectionReference(user.id);
    const querySnapshot = await policiesCollectionRef.get();

    const policies: PolicyWithId[] = querySnapshot.docs.map((doc) => {
      const firestoreData = doc.data() as FirestorePolicyType;
      return convertFirestorePolicyToPolicy(doc.id, firestoreData);
    });

    return createSuccessResult(policies);
  } catch (error) {
    // console.error("Failed to get policies:", error);
    return createFailureResult("UNKNOWN_ERROR");
  }
};

/**
 * Creates a standardized failure result object.
 *
 * @template T The type of the error code.
 * @param code The specific `POLICY_GET_ERROR_CODE` for the failure.
 * @returns A `Failure` object with the specified error code.
 */
const createFailureResult = <T extends POLICY_GET_ERROR_CODE>(
  code: T
): Failure<T> => ({ success: false, error: { code } });

const createSuccessResult = (
  policies: PolicyWithId[]
): Success<PolicyWithId[]> => ({
  success: true,
  data: policies,
});
