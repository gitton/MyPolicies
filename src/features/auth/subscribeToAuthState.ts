// Firebase auth state subscription utility
import { User } from "@/types/User";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";

export type AuthStateListener = {
  onAuthStateChanged: (user: User | null) => void;
};

export const subscribeToAuthState = (
  listener: AuthStateListener
): (() => void) => {
  const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
    listener.onAuthStateChanged(user ? { id: user.uid } : null);
  });
  return unsubscribe;
};
