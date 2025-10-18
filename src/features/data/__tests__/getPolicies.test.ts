import { Failure, Success } from "@/features/Result";
import { getCurrentUser } from "@/features/auth/getCurrentUser";
import { getPoliciesCollectionReference } from "@/features/data/firestore/getCollectionReference";
import {
  getPolicies,
  POLICY_GET_ERROR_CODE,
} from "@/features/data/getPolicies";
import { FirestorePolicyType } from "@/types/FirestorePolicyType";
import type { PolicyWithId } from "@/types/PolicyTypeWithId";

type PolicyGetFailure = Failure<POLICY_GET_ERROR_CODE>;

// Mock Timestamp with toDate method
const createMockTimestamp = (date: Date) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
});

jest.mock("@/features/auth/getCurrentUser", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/features/data/firestore/getCollectionReference", () => ({
  getPoliciesCollectionReference: jest.fn(),
}));

// Tests for getting policies functionality
describe("getPolicies", () => {
  //  mock Firestore documents (what's stored in Firestore)
  const mockPoliciesFirestore: FirestorePolicyType[] = [
    {
      id: "policy-id-1",
      provider: "Test Insurance Co",
      policyNumber: "POL-12345",
      premium: "500.00",
      startDate: createMockTimestamp(new Date("2024-01-01")) as any,
      endDate: createMockTimestamp(new Date("2024-12-31")) as any,
      policyType: "car",
      createdAt: createMockTimestamp(new Date("2024-01-01")) as any,
      updatedAt: createMockTimestamp(new Date("2024-01-01")) as any,
    },
    {
      id: "policy-id-2",
      provider: "Another Insurance Co",
      policyNumber: "POL-67890",
      premium: "750.00",
      startDate: createMockTimestamp(new Date("2024-02-01")) as any,
      endDate: createMockTimestamp(new Date("2025-02-01")) as any,
      policyType: "house",
      createdAt: createMockTimestamp(new Date("2024-02-01")) as any,
      updatedAt: createMockTimestamp(new Date("2024-02-01")) as any,
    },
  ];

  // Expected output (what the function should return - PolicyType with Dates)
  const expectedPolicies: PolicyWithId[] = [
    {
      id: "policy-id-1",
      provider: "Test Insurance Co",
      policyNumber: "POL-12345",
      premium: "500.00",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      policyType: "car",
    },
    {
      id: "policy-id-2",
      provider: "Another Insurance Co",
      policyNumber: "POL-67890",
      premium: "750.00",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2025-02-01"),
      policyType: "house",
    },
  ];

  const createMockDoc = (id: string, data: FirestorePolicyType) => ({
    id,
    data: () => data,
  });

  const mockDocs = [
    createMockDoc("policy-id-1", mockPoliciesFirestore[0]),
    createMockDoc("policy-id-2", mockPoliciesFirestore[1]),
  ];

  const mockQuerySnapshot = {
    docs: mockDocs,
  };

  const mockCollectionRef = {
    get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (getPoliciesCollectionReference as jest.Mock).mockReturnValue(
      mockCollectionRef
    );
    mockCollectionRef.get.mockResolvedValue(mockQuerySnapshot);
  });

  it("should invoke getCurrentUser to check if user is logged in", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue(null);
    await getPolicies();
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("should return a failure result with UNAUTHENTICATED when user is not authenticated", async () => {
    (getCurrentUser as jest.Mock).mockReturnValue(null);
    const result = await getPolicies();
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect((result as PolicyGetFailure).success).toBe(false);
    expect((result as PolicyGetFailure).error.code).toEqual("UNAUTHENTICATED");
  });

  it("should call getPoliciesCollectionReference with the user ID", async () => {
    const mockUserId = "user-123";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });

    await getPolicies();

    expect(getPoliciesCollectionReference).toHaveBeenCalledTimes(1);
    expect(getPoliciesCollectionReference).toHaveBeenCalledWith(mockUserId);
  });

  it("should call get() on the collection reference", async () => {
    const mockUserId = "user-123";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });

    await getPolicies();

    expect(mockCollectionRef.get).toHaveBeenCalledTimes(1);
  });

  it("should return a success result with an array of policies with IDs", async () => {
    const mockUserId = "user-123";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });

    const result = await getPolicies();

    expect(result.success).toBe(true);
    expect((result as Success<PolicyWithId[]>).data).toHaveLength(2);
    expect((result as Success<PolicyWithId[]>).data[0]).toEqual(
      expectedPolicies[0]
    );
    expect((result as Success<PolicyWithId[]>).data[1]).toEqual(
      expectedPolicies[1]
    );
  });

  it("should return a success result with an empty array when no policies exist", async () => {
    const mockUserId = "user-123";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });
    (mockCollectionRef.get as jest.Mock).mockResolvedValue({
      docs: [],
    });

    const result = await getPolicies();

    expect(result.success).toBe(true);
    expect((result as Success<PolicyWithId[]>).data).toEqual([]);
    expect((result as Success<PolicyWithId[]>).data).toHaveLength(0);
  });

  it("should return a failure result with UNKNOWN_ERROR if collectionReference.get throws an error", async () => {
    const mockUserId = "user-123";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });
    (mockCollectionRef.get as jest.Mock).mockRejectedValue(
      new Error("Firestore error")
    );

    const result = await getPolicies();

    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect(getPoliciesCollectionReference).toHaveBeenCalledWith(mockUserId);
    expect(mockCollectionRef.get).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect((result as PolicyGetFailure).error.code).toEqual("UNKNOWN_ERROR");
  });

  it("should map all document data correctly with their IDs", async () => {
    const mockUserId = "user-123";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });

    const result = await getPolicies();

    expect(result.success).toBe(true);
    const policies = (result as Success<PolicyWithId[]>).data;

    // Verify each policy has an ID
    policies.forEach((policy) => {
      expect(policy.id).toBeDefined();
      expect(typeof policy.id).toBe("string");
    });

    // Verify correct number of policies
    expect(policies).toHaveLength(2);
  });

  it("should handle single policy correctly", async () => {
    const mockUserId = "user-123";
    (getCurrentUser as jest.Mock).mockReturnValue({ id: mockUserId });

    const singleDoc = [
      createMockDoc("single-policy-id", mockPoliciesFirestore[0]),
    ];

    (mockCollectionRef.get as jest.Mock).mockResolvedValue({
      docs: singleDoc,
    });

    const result = await getPolicies();

    expect(result.success).toBe(true);
    expect((result as Success<PolicyWithId[]>).data).toHaveLength(1);
    expect((result as Success<PolicyWithId[]>).data[0]).toEqual({
      id: "single-policy-id",
      provider: "Test Insurance Co",
      policyNumber: "POL-12345",
      premium: "500.00",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      policyType: "car",
    });
  });
});
