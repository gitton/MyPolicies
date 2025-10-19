import { isNativeFirebaseError } from "../isNativeFirebaseError";

describe("isNativeFirebaseError", () => {
  it("should return true for a native Firebase error object", () => {
    const firebaseError = {
      code: "auth/invalid-email",
      message: "The email address is badly formatted.",
    };
    expect(isNativeFirebaseError(firebaseError)).toBe(true);
  });

  it("should return false for a generic Error object", () => {
    const genericError = new Error("Something went wrong");
    expect(isNativeFirebaseError(genericError)).toBe(false);
  });

  it("should return false for an object without a 'code' property", () => {
    const errorWithoutCode = { message: "No code here" };
    expect(isNativeFirebaseError(errorWithoutCode)).toBe(false);
  });

  it("should return false for an object with a non-string 'code' property", () => {
    const errorWithNonStringCode = { code: 123, message: "Invalid code" };
    expect(isNativeFirebaseError(errorWithNonStringCode)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isNativeFirebaseError(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isNativeFirebaseError(undefined)).toBe(false);
  });

  it("should return false for a string", () => {
    expect(isNativeFirebaseError("some error")).toBe(false);
  });

  it("should return false for a number", () => {
    expect(isNativeFirebaseError(123)).toBe(false);
  });
});
