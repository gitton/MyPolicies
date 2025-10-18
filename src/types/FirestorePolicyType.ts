import type { Timestamp } from "@react-native-firebase/firestore";

export type FirestorePolicyType = {
  id: string;
  provider: string;
  policyNumber: string;
  premium: string;
  startDate: Timestamp;
  endDate: Timestamp;
  policyType: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
