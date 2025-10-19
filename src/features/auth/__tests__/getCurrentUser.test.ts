import { getCurrentUser } from "@/features/auth/getCurrentUser";
import { FirebaseAuthTypes, getAuth } from "@react-native-firebase/auth";

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: jest.fn(),
}));

describe("getCurrentUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return null if no user is authenticated", () => {
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
    });
    const result = getCurrentUser();
    expect(result).toBeNull();
    expect(getAuth).toHaveBeenCalledTimes(1);
  });

  it("should return a User object if a user is authenticated", () => {
    const mockUser: Partial<FirebaseAuthTypes.User> = {
      uid: "test-uid",
      email: "test@test.com",
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: "2021-01-01",
        lastSignInTime: "2021-01-01",
      },
    };
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: mockUser,
    });
    const result = getCurrentUser();
    expect(result).toEqual({ id: "test-uid" });
    expect(getAuth).toHaveBeenCalledTimes(1);
  });
});
