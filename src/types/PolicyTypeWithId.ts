import { PolicyType } from "./PolicyType";

/**
 * Extended PolicyType with Firestore document ID.
 */
export type PolicyWithId = PolicyType & { id: string };
