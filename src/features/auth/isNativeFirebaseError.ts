// Type guard to check if error is a native Firebase error

import { ReactNativeFirebase } from "@react-native-firebase/app";

export const isNativeFirebaseError = (
  error: unknown
): error is ReactNativeFirebase.NativeFirebaseError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
};
