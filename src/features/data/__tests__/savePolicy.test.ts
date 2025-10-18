import { Failure, Success } from "@/features/Result";
import { getCurrentUser } from "@/features/auth/getCurrentUser";
import { getPoliciesCollectionReference } from "@/features/data/firestore/getCollectionReference";
import { getUniqueId } from "@/features/data/firestore/getUniqueId";
import { POLICY_SAVE_ERROR_CODE, savePolicy } from "@/features/data/savePolicy";
import { PolicyType } from "@/types/PolicyType";
import { getEndOfDay } from "@/utils/getEndOfDay";
import { getStartOfDay } from "@/utils/getStartOfDay";
import { serverTimestamp } from "@react-native-firebase/firestore";

type PolicySaveFailure = Failure<POLICY_SAVE_ERROR_CODE>;

// Mock serverTimestamp to return a predictable value for testing
const mockTimestamp = { _methodName: "FieldValue.serverTimestamp" };

jest.mock("@react-native-firebase/firestore", () => ({
  serverTimestamp: jest.fn(),
}));

jest.mock("@/features/auth/getCurrentUser", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/features/data/firestore/getCollectionReference", () => ({
  getPoliciesCollectionReference: jest.fn(),
}));

jest.mock("@/features/data/firestore/getUniqueId", () => ({
  getUniqueId: jest.fn(),
}));

jest.mock("@/utils/getStartOfDay");
jest.mock("@/utils/getEndOfDay");

// Tests for saving policy functionality
describe("savePolicy", () => {
  const mockPolicy: PolicyType = {
    provider: "Test Insurance Co",
    policyNumber: "POL-12345",
    premium: "500.00",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    policyType: "car",
  };

  const mockFirestoreDoc = {
    id: "mock-policy-id",
    set: jest.fn(() => Promise.resolve()),
  };

  const mockCollectionRef = {
    doc: jest.fn(() => mockFirestoreDoc),
  };

  const mockUserDocRef = {
    collection: jest.fn(() => mockCollectionRef),
  };

  const mockUserCollectionRef = {
    doc: jest.fn(() => mockUserDocRef),
  };

  jest.mock("@react-native-firebase/firestore", () => ({
    __esModule: true,
    default: jest.fn(() => ({
      collection: jest.fn(() => mockUserCollectionRef),
    })),
  }));

  beforeEach(() => {
    jest.resetAllMocks();
    (getPoliciesCollectionReference as jest.Mock).mockReturnValue(
      mockCollectionRef
    );
    (getUniqueId as jest.Mock).mockReturnValue(mockFirestoreDoc.id);
    (serverTimestamp as jest.Mock).mockReturnValue(mockTimestamp);
    (getStartOfDay as jest.Mock).mockImplementation((date: Date) => {
      const d = new Date(date.getTime());
      d.setHours(0, 0, 0, 0);
      return d;
    });
    (getEndOfDay as jest.Mock).mockImplementation((date: Date) => {
      const d = new Date(date.getTime());
      d.setHours(23, 59, 59, 999);
      return d;
    });
  });

  it("should invoke getCurrentUser to check if user is logged in", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue(null);
    await savePolicy(mockPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should return a failure result with UNAUTHENTICATED when user is not authenticated", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue(null);
    const result = await savePolicy(mockPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual("UNAUTHENTICATED");
  });

  it("should return a failure result with VALIDATION_ERROR when provider is empty", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      provider: "",
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.provider).toEqual([
      "Provider name is required",
    ]);
  });

  it("should return a failure result with VALIDATION_ERROR when provider name is too long", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      provider: "A".repeat(101),
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.provider).toEqual([
      "Provider name is too long",
    ]);
  });

  it("should return a failure result with VALIDATION_ERROR when policy number is empty", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      policyNumber: "",
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.policyNumber).toEqual([
      "Policy number is required",
      "Policy number must contain only letters, numbers, and hyphens",
    ]);
  });

  it("should return a failure result with VALIDATION_ERROR when policy number is too long", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      policyNumber: "A".repeat(51),
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.policyNumber).toEqual([
      "Policy number is too long",
    ]);
  });

  it("should return a failure result with VALIDATION_ERROR when policy number contains invalid characters", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      policyNumber: "POL@12345!",
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.policyNumber).toEqual([
      "Policy number must contain only letters, numbers, and hyphens",
    ]);
  });

  it("should return a failure result with VALIDATION_ERROR when premium is empty", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      premium: "",
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.premium).toEqual([
      "Premium amount is required",
      "Premium must be a valid amount (e.g., 123.45)",
    ]);
  });

  it("should return a failure result with VALIDATION_ERROR when premium format is invalid", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      premium: "abc",
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.premium).toEqual([
      "Premium must be a valid amount (e.g., 123.45)",
    ]);
  });

  it("should return a failure result with VALIDATION_ERROR when premium has more than 2 decimal places", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      premium: "500.123",
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.premium).toEqual([
      "Premium must be a valid amount (e.g., 123.45)",
    ]);
  });
  it("should return a failure result with VALIDATION_ERROR when start date is after end date", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      startDate: new Date("2024-12-31"),
      endDate: new Date("2024-01-01"),
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.endDate).toEqual([
      "Start date must be before end date",
    ]);
  });

  it("should successfully save when start date and end date are on the same day (after normalization start is 00:00:00 and end is 23:59:59)", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const mockSetFn = jest.fn(() => Promise.resolve());
    (mockCollectionRef.doc as jest.Mock).mockReturnValue({
      set: mockSetFn,
    });

    const policyWithSameDay: PolicyType = {
      ...mockPolicy,
      startDate: new Date("2024-12-31"),
      endDate: new Date("2024-12-31"),
    };

    const result = await savePolicy(policyWithSameDay);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    // After normalization: start is at 00:00:00 and end is at 23:59:59, so validation passes
    expect(mockSetFn).toHaveBeenCalledTimes(1);
  });

  it("should return a failure result with VALIDATION_ERROR when policyType is invalid", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({ id: "user-123" });
    const invalidPolicy: PolicyType = {
      ...mockPolicy,
      policyType: "invalid-type" as any, // Cast to any to bypass type checking for the test
    };

    const result = await savePolicy(invalidPolicy);
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicySaveFailure).success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual(
      "VALIDATION_ERROR"
    );
    expect((result as PolicySaveFailure).error.details?.policyType).toEqual([
      "Invalid enum value. Expected 'car' | 'van' | 'motorbike' | 'house', received 'invalid-type'",
    ]);
  });

  it("should save the policy to Firestore and return a success result with the policy ID", async () => {
    const mockUserId = "user-123";
    const mockPolicyId = "mock-policy-id";
    const mockSetFn = jest.fn(() => Promise.resolve());

    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });
    (getUniqueId as jest.Mock).mockReturnValue(mockPolicyId);
    (mockCollectionRef.doc as jest.Mock).mockReturnValue({
      set: mockSetFn,
    });

    const result = await savePolicy(mockPolicy);

    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect(getPoliciesCollectionReference).toHaveBeenCalledWith(mockUserId);
    expect(getUniqueId).toHaveBeenCalledTimes(1);
    expect(getUniqueId).toHaveBeenCalledWith(mockCollectionRef.doc());
    expect(mockCollectionRef.doc).toHaveBeenCalledWith(mockPolicyId);

    // Verify that set() was called with the correct data including timestamps
    expect(mockSetFn).toHaveBeenCalledTimes(1);
    const callArgs = (mockSetFn.mock.calls as any)[0]?.[0];
    expect(callArgs).toBeDefined();
    expect(callArgs).toMatchObject({
      provider: mockPolicy.provider,
      policyNumber: mockPolicy.policyNumber,
      premium: mockPolicy.premium,
      policyType: mockPolicy.policyType,
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
    });
    // Verify dates are normalized correctly
    expect(callArgs.startDate).toBeInstanceOf(Date);
    expect(callArgs.endDate).toBeInstanceOf(Date);

    expect(result.success).toBe(true);
    expect((result as Success<string>).data).toEqual(mockFirestoreDoc.id);
  });

  it("should add createdAt and updatedAt timestamps when saving policy", async () => {
    const mockUserId = "user-123";
    const mockPolicyId = "policy-456";
    const mockSetFn = jest.fn(() => Promise.resolve());

    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });
    (getUniqueId as jest.Mock).mockReturnValue(mockPolicyId);
    (mockCollectionRef.doc as jest.Mock).mockReturnValue({
      set: mockSetFn,
    });

    await savePolicy(mockPolicy);

    // Verify that set was called
    expect(mockSetFn).toHaveBeenCalledTimes(1);

    // Verify that both createdAt and updatedAt timestamps are included

    const callArguments = (mockSetFn.mock.calls as any)[0]?.[0];
    expect(callArguments).toBeDefined();
    expect(callArguments).toHaveProperty("createdAt", mockTimestamp);
    expect(callArguments).toHaveProperty("updatedAt", mockTimestamp);

    // Ensure the original policy data is preserved
    expect(callArguments.provider).toBe(mockPolicy.provider);
    expect(callArguments.policyNumber).toBe(mockPolicy.policyNumber);
    expect(callArguments.premium).toBe(mockPolicy.premium);

    // Dates should be normalized: start date to beginning of day, end date to end of day
    expect(callArguments.startDate).toBeInstanceOf(Date);
    expect(callArguments.endDate).toBeInstanceOf(Date);
    expect(callArguments.startDate.getHours()).toBe(0);
    expect(callArguments.startDate.getMinutes()).toBe(0);
    expect(callArguments.startDate.getSeconds()).toBe(0);
    expect(callArguments.startDate.getMilliseconds()).toBe(0);
    expect(callArguments.endDate.getHours()).toBe(23);
    expect(callArguments.endDate.getMinutes()).toBe(59);
    expect(callArguments.endDate.getSeconds()).toBe(59);
    expect(callArguments.endDate.getMilliseconds()).toBe(999);

    expect(callArguments.policyType).toBe(mockPolicy.policyType);
  });

  //this make sure that for given date in any time zone
  //start date will be normalized to beginning of the day timestamp in the current timezone (00:00:00)
  //end date will be normalized to end of the day timestamp in the current timezone (23:59:59)
  it("should normalize dates to beginning of the day timestamp for start of the day and end for end of the date in the current timezone", async () => {
    // Mock the timezone to UK (Europe/London)
    const originalTZ = process.env.TZ;
    process.env.TZ = "Europe/London";

    try {
      const mockUserId = "user-123";
      const mockPolicyId = "policy-456";
      const mockSetFn = jest.fn(() => Promise.resolve());

      // Create a date for October 25, 2025 with a specific time (3:45:30 PM UK time)
      const startDateWithTime = new Date("2025-10-25T15:45:30");
      const endDateWithTime = new Date("2026-10-25T15:45:30");

      const policyWithTime: PolicyType = {
        provider: "Test Insurance Co",
        policyNumber: "POL-12345",
        premium: "500.00",
        startDate: startDateWithTime,
        endDate: endDateWithTime,
        policyType: "car",
      };

      (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });
      (getUniqueId as jest.Mock).mockReturnValue(mockPolicyId);
      (mockCollectionRef.doc as jest.Mock).mockReturnValue({
        set: mockSetFn,
      });

      await savePolicy(policyWithTime);

      // Verify that getStartOfDay was called with start date and getEndOfDay with end date
      expect(getStartOfDay).toHaveBeenCalledWith(startDateWithTime);
      expect(getEndOfDay).toHaveBeenCalledWith(endDateWithTime);

      // Verify that the normalized dates were used correctly
      const callArguments = (mockSetFn.mock.calls as any)[0]?.[0];
      expect(callArguments).toBeDefined();

      // The normalized start date should be at 00:00:00.000 and end date at 23:59:59.999
      const normalizedStartDate = callArguments.startDate;
      const normalizedEndDate = callArguments.endDate;

      expect(normalizedStartDate.getHours()).toBe(0);
      expect(normalizedStartDate.getMinutes()).toBe(0);
      expect(normalizedStartDate.getSeconds()).toBe(0);
      expect(normalizedStartDate.getMilliseconds()).toBe(0);

      expect(normalizedEndDate.getHours()).toBe(23);
      expect(normalizedEndDate.getMinutes()).toBe(59);
      expect(normalizedEndDate.getSeconds()).toBe(59);
      expect(normalizedEndDate.getMilliseconds()).toBe(999);

      // Verify the dates are still October 25, 2025 and October 25, 2026
      expect(normalizedStartDate.getDate()).toBe(25);
      expect(normalizedStartDate.getMonth()).toBe(9); // October is month 9 (0-indexed)
      expect(normalizedStartDate.getFullYear()).toBe(2025);

      expect(normalizedEndDate.getDate()).toBe(25);
      expect(normalizedEndDate.getMonth()).toBe(9);
      expect(normalizedEndDate.getFullYear()).toBe(2026);
    } finally {
      // Restore the original timezone
      if (originalTZ !== undefined) {
        process.env.TZ = originalTZ;
      } else {
        delete process.env.TZ;
      }
    }
  });

  it("should return a failure result with UNKNOWN_ERROR if documentReference.set throws an error", async () => {
    const mockUserId = "user-123";
    const mockPolicyId = "mock-policy-id";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });
    (getUniqueId as jest.Mock).mockReturnValue(mockPolicyId);
    (mockCollectionRef.doc as jest.Mock).mockReturnValue({
      set: jest.fn(() => Promise.reject(new Error("Firestore error"))),
    });

    const result = await savePolicy(mockPolicy);

    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect(getPoliciesCollectionReference).toHaveBeenCalledWith(mockUserId);
    expect(getUniqueId).toHaveBeenCalledTimes(1);
    expect(getUniqueId).toHaveBeenCalledWith(mockCollectionRef.doc());
    expect(mockCollectionRef.doc).toHaveBeenCalledWith(mockPolicyId);

    expect(result.success).toBe(false);
    expect((result as PolicySaveFailure).error.code).toEqual("UNKNOWN_ERROR");
  });
});
