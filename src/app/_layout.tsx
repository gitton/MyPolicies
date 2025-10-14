import { subscribeToAuthState } from "@/features/auth/subscribeToAuthState";
import { clearUser, setUser } from "@/state/slices/authSlice";
import { store } from "@/state/store";
import { User } from "@/types/User";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Provider, useDispatch } from "react-redux";

function AppContent() {
  const dispatch = useDispatch();

  // Listen to Firebase auth state changes and update Redux store
  useEffect(() => {
    const unsubscribe = subscribeToAuthState({
      onAuthStateChanged: (user: User | null) => {
        if (user) {
          dispatch(setUser(user));
        } else {
          dispatch(clearUser());
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return <Slot />;
}

// Root layout with Redux store and keyboard handling
export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </KeyboardProvider>
  );
}
