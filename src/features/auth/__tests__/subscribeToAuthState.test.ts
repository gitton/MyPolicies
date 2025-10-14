import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { waitFor } from "@testing-library/react-native";
// Mock the entire module
jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
}));

import {
  AuthStateListener,
  subscribeToAuthState,
} from "@/features/auth/subscribeToAuthState";
import { onAuthStateChanged } from "@react-native-firebase/auth";

const mockUnsubscribe: () => void = jest.fn();

// Tests for subscribe to auth state functionality

describe("subscribeToAuthState", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should invoke the onAuthStateChanged on firebase auth function when subscribe to auth state is called", () => {
    (onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);
    const listener: AuthStateListener = {
      onAuthStateChanged: jest.fn(),
    };
    subscribeToAuthState(listener);
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  it("should call the auth state Listener when the on auth state changed from firebase auth is called with user null", async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_, callback: any) => {
      setTimeout(() => callback(null), 0);
      return mockUnsubscribe;
    });
    const mockOnAuthStateListener = jest.fn();
    const listener: AuthStateListener = {
      onAuthStateChanged: mockOnAuthStateListener,
    };
    subscribeToAuthState(listener);

    await waitFor(() => {
      expect(listener.onAuthStateChanged).toHaveBeenCalledTimes(1);
      expect(listener.onAuthStateChanged).toHaveBeenCalledWith(null);
    });
  });

  it("should call the auth stateListener when the on auth state changed from firebase auth is called with user authenticated", async () => {
    const mockUserId = "123";

    const mockUser: Partial<FirebaseAuthTypes.User> = {
      uid: mockUserId,
      email: "test@test.com",
    };

    (onAuthStateChanged as jest.Mock).mockImplementation((_, listener: any) => {
      setTimeout(() => listener(mockUser), 0);
      return mockUnsubscribe;
    });
    const mockOnAuthStateListener = jest.fn();
    const listener: AuthStateListener = {
      onAuthStateChanged: mockOnAuthStateListener,
    };
    subscribeToAuthState(listener);

    await waitFor(() => {
      expect(listener.onAuthStateChanged).toHaveBeenCalledTimes(1);
      expect(listener.onAuthStateChanged).toHaveBeenCalledWith({
        id: mockUserId,
      });
    });
  });

  it("should call the clean up function from firebase auth when the return function is called", () => {
    (onAuthStateChanged as jest.Mock).mockImplementation(() => mockUnsubscribe);

    const listener: AuthStateListener = { onAuthStateChanged: jest.fn() };
    const unsubscribe = subscribeToAuthState(listener);

    unsubscribe();

    expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
