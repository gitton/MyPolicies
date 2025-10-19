import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export const getUniqueId = (
  firestoreDoc: FirebaseFirestoreTypes.DocumentReference
): string => {
  return firestoreDoc.id;
};
