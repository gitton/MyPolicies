// Firebase email/password authentication with network and error handling
import { isNativeFirebaseError } from "@/features/auth/isNativeFirebaseError";
import {
  Failure,
  GENERIC_ERROR_CODE,
  Result,
  Success,
} from "@/features/Result";
import { User } from "@/types/User";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { getNetworkStateAsync } from "expo-network";

export type SIGN_IN_WITH_ERROR_CODE =
  | GENERIC_ERROR_CODE
  | "AUTH_INVALID_CREDENTIALS";

export const signInWithEmailPassword = async (
  email: string,
  password: string
): Promise<Result<User, SIGN_IN_WITH_ERROR_CODE>> => {
  const networkState = await getNetworkStateAsync();
  if (networkState.isConnected !== true) {
    return createFailureResult("NO_NETWORK_ERROR");
  }
  try {
    const userCredential: FirebaseAuthTypes.UserCredential =
      await signInWithEmailAndPassword(getAuth(), email, password);
    return createSuccessResult(userCredential);
  } catch (error) {
    if (isNativeFirebaseError(error)) {
      if (error.code === "auth/invalid-credential") {
        return createFailureResult("AUTH_INVALID_CREDENTIALS");
      }
    }
    return createFailureResult("UNKNOWN_ERROR");
  }
};

const createFailureResult = (
  code: SIGN_IN_WITH_ERROR_CODE
): Failure<SIGN_IN_WITH_ERROR_CODE> => ({ success: false, error: { code } });

const createSuccessResult = (
  user: FirebaseAuthTypes.UserCredential
): Success<User> => ({
  success: true,
  data: { id: user.user.uid },
});
