import type { FirestorePolicyType } from "@/types/FirestorePolicyType";
import type { PolicyWithId } from "@/types/PolicyTypeWithId";
import { convertFirestorePolicyToPolicy } from "@/utils/convertFirestorePolicyToPolicy";
import { Timestamp } from "@react-native-firebase/firestore";
// Mock Timestamp with toDate method
const createMockTimestamp = (date: Date) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
});

describe("convertFirestorePolicyToPolicy", () => {
  it("should convert a Firestore policy document to a PolicyWithId object", () => {
    // Arrange
    const documentId = "policy123";
    const startDate = new Date("2024-01-01T00:00:00.000Z");
    const endDate = new Date("2025-01-01T00:00:00.000Z");
    const createdAt = new Date("2023-12-01T00:00:00.000Z");
    const updatedAt = new Date("2023-12-15T00:00:00.000Z");

    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId", // This should be ignored in favor of documentId
      provider: "ABC Insurance",
      policyNumber: "POL-123456",
      premium: "1200.00",
      startDate: createMockTimestamp(startDate) as any,
      endDate: createMockTimestamp(endDate) as any,
      policyType: "car",
      createdAt: createMockTimestamp(createdAt) as any,
      updatedAt: createMockTimestamp(updatedAt) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy(documentId, firestorePolicy);

    // Assert
    expect(result).toEqual({
      id: documentId,
      provider: "ABC Insurance",
      policyNumber: "POL-123456",
      premium: "1200.00",
      startDate: startDate,
      endDate: endDate,
      policyType: "car",
    });
  });

  it("should correctly convert Timestamp objects to Date objects", () => {
    // Arrange
    const documentId = "doc456";
    const startDate = new Date("2023-06-15T10:30:00.000Z");
    const endDate = new Date("2024-06-15T10:30:00.000Z");

    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId",
      provider: "XYZ Insurance",
      policyNumber: "XYZ-789",
      premium: "850.50",
      startDate: createMockTimestamp(startDate) as any,
      endDate: createMockTimestamp(endDate) as any,
      policyType: "motorbike",
      createdAt: createMockTimestamp(new Date()) as any,
      updatedAt: createMockTimestamp(new Date()) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy(documentId, firestorePolicy);

    // Assert
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(result.startDate.getTime()).toBe(startDate.getTime());
    expect(result.endDate.getTime()).toBe(endDate.getTime());
  });

  it("should handle van policy type", () => {
    // Arrange
    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId",
      provider: "Van Insurance Co",
      policyNumber: "VAN-001",
      premium: "2500.00",
      startDate: createMockTimestamp(new Date("2024-03-01")) as any,
      endDate: createMockTimestamp(new Date("2025-03-01")) as any,
      policyType: "van",
      createdAt: createMockTimestamp(new Date()) as any,
      updatedAt: createMockTimestamp(new Date()) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy("doc789", firestorePolicy);

    // Assert
    expect(result.policyType).toBe("van");
  });

  it("should handle house policy type", () => {
    // Arrange
    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId",
      provider: "Home Insurance Ltd",
      policyNumber: "HOME-2024",
      premium: "500.00",
      startDate: createMockTimestamp(new Date("2024-01-01")) as any,
      endDate: createMockTimestamp(new Date("2025-01-01")) as any,
      policyType: "house",
      createdAt: createMockTimestamp(new Date()) as any,
      updatedAt: createMockTimestamp(new Date()) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy("house123", firestorePolicy);

    // Assert
    expect(result.policyType).toBe("house");
  });

  it("should preserve all policy details including special characters", () => {
    // Arrange
    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId",
      provider: "O'Brien & Associates Insurance",
      policyNumber: "POL-2024-ABC-123",
      premium: "1234.56",
      startDate: createMockTimestamp(new Date("2024-05-20")) as any,
      endDate: createMockTimestamp(new Date("2025-05-20")) as any,
      policyType: "car",
      createdAt: createMockTimestamp(new Date()) as any,
      updatedAt: createMockTimestamp(new Date()) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy(
      "special123",
      firestorePolicy
    );

    // Assert
    expect(result.provider).toBe("O'Brien & Associates Insurance");
    expect(result.policyNumber).toBe("POL-2024-ABC-123");
    expect(result.premium).toBe("1234.56");
  });

  it("should use the provided document ID instead of the Firestore id field", () => {
    // Arrange
    const documentId = "actualDocumentId";
    const firestorePolicy: FirestorePolicyType = {
      id: "differentId", // This should be ignored
      provider: "Insurance Co",
      policyNumber: "POL-999",
      premium: "1000.00",
      startDate: createMockTimestamp(new Date("2024-01-01")) as any,
      endDate: createMockTimestamp(new Date("2025-01-01")) as any,
      policyType: "car",
      createdAt: createMockTimestamp(new Date()) as any,
      updatedAt: createMockTimestamp(new Date()) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy(documentId, firestorePolicy);

    // Assert
    expect(result.id).toBe(documentId);
    expect(result.id).not.toBe(firestorePolicy.id);
  });

  it("should handle timestamps with millisecond precision", () => {
    // Arrange
    const startDate = new Date("2024-01-15T14:32:45.123Z");
    const endDate = new Date("2025-01-15T14:32:45.456Z");

    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId",
      provider: "Precise Insurance",
      policyNumber: "PREC-001",
      premium: "999.99",
      startDate: createMockTimestamp(startDate) as any,
      endDate: createMockTimestamp(endDate) as any,
      policyType: "car",
      createdAt: createMockTimestamp(new Date()) as any,
      updatedAt: createMockTimestamp(new Date()) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy(
      "precise123",
      firestorePolicy
    );

    // Assert
    expect(result.startDate.getTime()).toBe(startDate.getTime());
    expect(result.endDate.getTime()).toBe(endDate.getTime());
    expect(result.startDate.getMilliseconds()).toBe(123);
    expect(result.endDate.getMilliseconds()).toBe(456);
  });

  it("should not include Firestore-specific fields (createdAt, updatedAt) in the result", () => {
    // Arrange
    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId",
      provider: "Insurance Co",
      policyNumber: "POL-001",
      premium: "1000.00",
      startDate: createMockTimestamp(new Date("2024-01-01")) as Timestamp,
      endDate: createMockTimestamp(new Date("2025-01-01")) as any,
      policyType: "car",
      createdAt: createMockTimestamp(new Date("2023-01-01")) as any,
      updatedAt: createMockTimestamp(new Date("2023-12-31")) as any,
    };

    // Act
    const result = convertFirestorePolicyToPolicy(
      "doc123",
      firestorePolicy
    ) as any;

    // Assert
    expect(result.createdAt).toBeUndefined();
    expect(result.updatedAt).toBeUndefined();
  });

  it("should correctly type the result as PolicyWithId", () => {
    // Arrange
    const firestorePolicy: FirestorePolicyType = {
      id: "firestoreId",
      provider: "Type Test Insurance",
      policyNumber: "TYPE-001",
      premium: "750.00",
      startDate: createMockTimestamp(new Date("2024-02-01")) as any,
      endDate: createMockTimestamp(new Date("2025-02-01")) as any,
      policyType: "car",
      createdAt: createMockTimestamp(new Date()) as any,
      updatedAt: createMockTimestamp(new Date()) as any,
    };

    // Act
    const result: PolicyWithId = convertFirestorePolicyToPolicy(
      "type123",
      firestorePolicy
    );

    // Assert - TypeScript will enforce this at compile time
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("provider");
    expect(result).toHaveProperty("policyNumber");
    expect(result).toHaveProperty("premium");
    expect(result).toHaveProperty("startDate");
    expect(result).toHaveProperty("endDate");
    expect(result).toHaveProperty("policyType");
  });
});
