import type { FirestorePolicyType } from "@/types/FirestorePolicyType";
import type { PolicyWithId } from "@/types/PolicyTypeWithId";

/**
 * Converts a Firestore policy document to a PolicyWithId object.
 *
 * Transforms Firestore Timestamp objects to JavaScript Date objects for easier handling
 * in the application. This function is used when fetching policies from Firestore.
 *
 * @param id The Firestore document ID.
 * @param firestorePolicy The Firestore policy data with Timestamp objects.
 * @returns A PolicyWithId object with Date objects instead of Timestamps.
 *
 * @example
 * ```ts
 * const firestorePolicy = {
 *   provider: "ABC Insurance",
 *   policyNumber: "POL-123",
 *   premium: "1200.00",
 *   startDate: Timestamp.fromDate(new Date("2024-01-01")),
 *   endDate: Timestamp.fromDate(new Date("2025-01-01")),
 *   policyType: "car",
 *   createdAt: Timestamp.now(),
 *   updatedAt: Timestamp.now()
 * };
 *
 * const policy = convertFirestorePolicyToPolicy("doc123", firestorePolicy);
 * // Returns: { id: "doc123", provider: "ABC Insurance", ..., startDate: Date, endDate: Date }
 * ```
 */
export const convertFirestorePolicyToPolicy = (
  id: string,
  firestorePolicy: FirestorePolicyType
): PolicyWithId => ({
  id,
  provider: firestorePolicy.provider,
  policyNumber: firestorePolicy.policyNumber,
  premium: firestorePolicy.premium,
  startDate: firestorePolicy.startDate.toDate(),
  endDate: firestorePolicy.endDate.toDate(),
  policyType: firestorePolicy.policyType as PolicyWithId["policyType"],
});
