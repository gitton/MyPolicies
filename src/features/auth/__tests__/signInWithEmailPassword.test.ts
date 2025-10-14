import { Failure, Success } from "@/features/Result";
import {
  SIGN_IN_WITH_ERROR_CODE,
  signInWithEmailPassword,
} from "@/features/auth/signInWithEmailPassword";
import { User } from "@/types/User";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { getNetworkStateAsync } from "expo-network";

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn(),
}));

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

// Tests for Firebase email/password authentication functionality
describe("signInWithEmailPassword", () => {
  const mockEmail = "test@test.com";
  const mockPassword = "password";
  const mockAuth = getAuth();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should invoke get network state on network library ", async () => {
    (getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: false,
    });
    await signInWithEmailPassword(mockEmail, mockPassword);
    expect(getNetworkStateAsync).toHaveBeenCalledTimes(1);
  });

  it("should return a failure result with NO_NETWORK_ERROR when the network is not connected", async () => {
    (getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: false,
    });
    const result = await signInWithEmailPassword(mockEmail, mockPassword);
    expect(getNetworkStateAsync).toHaveBeenCalledTimes(1);
    expect((result as Failure<SIGN_IN_WITH_ERROR_CODE>).error.code).toEqual(
      "NO_NETWORK_ERROR"
    );
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(0);
  });

  it("should return a failure result with NO_NETWORK_ERROR when the network connection property is not defined", async () => {
    (getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: undefined,
    });
    const result = await signInWithEmailPassword(mockEmail, mockPassword);
    expect(getNetworkStateAsync).toHaveBeenCalledTimes(1);
    expect((result as Failure<SIGN_IN_WITH_ERROR_CODE>).error.code).toEqual(
      "NO_NETWORK_ERROR"
    );
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(0);
  });

  it("should invoke sign in with email and password on firebase with email and password if the network is connected", async () => {
    (getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
    });
    const result = await signInWithEmailPassword(mockEmail, mockPassword);
    expect(getNetworkStateAsync).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      mockEmail,
      mockPassword
    );
  });

  // auth/invalid-credential can be either wrong email or wrong password
  // https://cloud.google.com/identity-platform/docs/admin/email-enumeration-protection
  it("should return a failure result with AUTH_INVALID_CREDENTIALS when the sign in with email on firebase auth return auth/invalid-credential", async () => {
    (getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
    });
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new MockNativeFirebaseError("auth/invalid-credential")
    );

    const result = await signInWithEmailPassword(mockEmail, mockPassword);
    expect(getNetworkStateAsync).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      mockEmail,
      mockPassword
    );
    expect((result as Failure<SIGN_IN_WITH_ERROR_CODE>).error.code).toEqual(
      "AUTH_INVALID_CREDENTIALS"
    );
  });

  it("should return a failure result with UNKNOWN_ERROR when the sign in with email on firebase auth return any other error than auth/invalid-credential ", async () => {
    (getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
    });
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new MockNativeFirebaseError("auth/other-error")
    );

    const result = await signInWithEmailPassword(mockEmail, mockPassword);
    expect(getNetworkStateAsync).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      mockEmail,
      mockPassword
    );
    expect((result as Failure<SIGN_IN_WITH_ERROR_CODE>).error.code).toEqual(
      "UNKNOWN_ERROR"
    );
  });

  it("should return a success result with user when the sign in with email, when firebase auth return user", async () => {
    (getNetworkStateAsync as jest.Mock).mockResolvedValue({
      isConnected: true,
    });
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: "123",
      },
    });

    const result = await signInWithEmailPassword(mockEmail, mockPassword);
    expect(getNetworkStateAsync).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      mockEmail,
      mockPassword
    );
    expect((result as Success<User>).data.id).toEqual("123");
  });
});

class MockNativeFirebaseError extends Error {
  code: string;
  constructor(code: string) {
    super();
    this.code = code;
  }
}
