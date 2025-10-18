// Tests for policy slice

import { getPolicies, PolicyWithId } from "@/features/data/getPolicies";
import { savePolicy } from "@/features/data/savePolicy";
import { setupStore } from "@/state/store";
import type { PolicyType } from "@/types/PolicyType";
import {
  addPolicy,
  clearError,
  clearPolicies,
  clearSaveError,
  createPolicy,
  fetchPolicies,
  removePolicy,
  updatePolicy,
} from "../policySlice";

// Mock the data functions
jest.mock("@/features/data/getPolicies");
jest.mock("@/features/data/savePolicy");

const mockGetPolicies = getPolicies as jest.MockedFunction<typeof getPolicies>;
const mockSavePolicy = savePolicy as jest.MockedFunction<typeof savePolicy>;

describe("policySlice", () => {
  let store: ReturnType<typeof setupStore>;

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = store.getState().policy;
      expect(state).toEqual({
        policies: [],
        loading: false,
        error: null,
        saving: false,
        saveError: null,
      });
    });
  });

  describe("reducers", () => {
    it("should clear policies", () => {
      // Add some policies first
      const policy: PolicyWithId = {
        id: "1",
        provider: "Test Provider",
        policyNumber: "TP-123",
        premium: "100.00",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        policyType: "car",
      };
      store.dispatch(addPolicy(policy));

      // Clear policies
      store.dispatch(clearPolicies());

      const state = store.getState().policy;
      expect(state.policies).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it("should clear save error", () => {
      // Manually set the state to have a save error
      store = setupStore({
        policy: {
          policies: [],
          loading: false,
          error: null,
          saving: false,
          saveError: "VALIDATION_ERROR",
        },
      });

      store.dispatch(clearSaveError());

      const state = store.getState().policy;
      expect(state.saveError).toBe(null);
    });

    it("should clear error", () => {
      // Manually set the state to have an error
      store = setupStore({
        policy: {
          policies: [],
          loading: false,
          error: "UNAUTHENTICATED",
          saving: false,
          saveError: null,
        },
      });

      store.dispatch(clearError());

      const state = store.getState().policy;
      expect(state.error).toBe(null);
    });

    it("should add a policy", () => {
      const policy: PolicyWithId = {
        id: "1",
        provider: "Test Provider",
        policyNumber: "TP-123",
        premium: "100.00",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        policyType: "car",
      };

      store.dispatch(addPolicy(policy));

      const state = store.getState().policy;
      expect(state.policies).toHaveLength(1);
      expect(state.policies[0]).toEqual(policy);
    });

    it("should remove a policy", () => {
      const policy1: PolicyWithId = {
        id: "1",
        provider: "Test Provider 1",
        policyNumber: "TP-123",
        premium: "100.00",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        policyType: "car",
      };
      const policy2: PolicyWithId = {
        id: "2",
        provider: "Test Provider 2",
        policyNumber: "TP-456",
        premium: "200.00",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        policyType: "house",
      };

      store.dispatch(addPolicy(policy1));
      store.dispatch(addPolicy(policy2));
      store.dispatch(removePolicy("1"));

      const state = store.getState().policy;
      expect(state.policies).toHaveLength(1);
      expect(state.policies[0].id).toBe("2");
    });

    it("should update a policy", () => {
      const policy: PolicyWithId = {
        id: "1",
        provider: "Test Provider",
        policyNumber: "TP-123",
        premium: "100.00",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        policyType: "car",
      };

      store.dispatch(addPolicy(policy));
      store.dispatch(
        updatePolicy({
          id: "1",
          changes: { provider: "Updated Provider", premium: "150.00" },
        })
      );

      const state = store.getState().policy;
      expect(state.policies[0].provider).toBe("Updated Provider");
      expect(state.policies[0].premium).toBe("150.00");
      expect(state.policies[0].policyNumber).toBe("TP-123");
    });
  });

  describe("async thunks", () => {
    describe("fetchPolicies", () => {
      it("should handle fetchPolicies pending", async () => {
        mockGetPolicies.mockImplementation(
          () => new Promise(() => {}) // Never resolves
        );

        store.dispatch(fetchPolicies());

        const state = store.getState().policy;
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it("should handle fetchPolicies fulfilled", async () => {
        const policies: PolicyWithId[] = [
          {
            id: "1",
            provider: "Test Provider",
            policyNumber: "TP-123",
            premium: "100.00",
            startDate: new Date("2024-01-01"),
            endDate: new Date("2025-01-01"),
            policyType: "car",
          },
        ];

        mockGetPolicies.mockResolvedValue({
          success: true,
          data: policies,
        });

        await store.dispatch(fetchPolicies());

        const state = store.getState().policy;
        expect(state.loading).toBe(false);
        expect(state.policies).toEqual(policies);
        expect(state.error).toBe(null);
      });

      it("should handle fetchPolicies rejected", async () => {
        mockGetPolicies.mockResolvedValue({
          success: false,
          error: { code: "UNAUTHENTICATED" },
        });

        await store.dispatch(fetchPolicies());

        const state = store.getState().policy;
        expect(state.loading).toBe(false);
        expect(state.error).toBe("UNAUTHENTICATED");
      });
    });

    describe("createPolicy", () => {
      const newPolicy: PolicyType = {
        provider: "New Provider",
        policyNumber: "NP-789",
        premium: "300.00",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        policyType: "motorbike",
      };

      it("should handle createPolicy pending", async () => {
        mockSavePolicy.mockImplementation(
          () => new Promise(() => {}) // Never resolves
        );

        store.dispatch(createPolicy(newPolicy));

        const state = store.getState().policy;
        expect(state.saving).toBe(true);
        expect(state.saveError).toBe(null);
      });

      it("should handle createPolicy fulfilled", async () => {
        mockSavePolicy.mockResolvedValue({
          success: true,
          data: "new-policy-id",
        });

        await store.dispatch(createPolicy(newPolicy));

        const state = store.getState().policy;
        expect(state.saving).toBe(false);
        expect(state.policies).toHaveLength(1);
        expect(state.policies[0]).toMatchObject({
          id: "new-policy-id",
          ...newPolicy,
        });
        expect(state.saveError).toBe(null);
      });

      it("should handle createPolicy rejected", async () => {
        mockSavePolicy.mockResolvedValue({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            details: {
              provider: ["Provider name is required"],
            },
          },
        });

        await store.dispatch(createPolicy(newPolicy));

        const state = store.getState().policy;
        expect(state.saving).toBe(false);
        expect(state.saveError).toBe("VALIDATION_ERROR");
      });
    });
  });
});
