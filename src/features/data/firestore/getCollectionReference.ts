import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import firestore from "@react-native-firebase/firestore";

export const getPoliciesCollectionReference = (
  userId: string
): FirebaseFirestoreTypes.CollectionReference => {
  return firestore().collection("users").doc(userId).collection("policies");
};
