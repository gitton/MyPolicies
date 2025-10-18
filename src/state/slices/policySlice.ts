// Redux slice for managing policy state

import { getPolicies } from "@/features/data/getPolicies";
import { savePolicy } from "@/features/data/savePolicy";
import type { PolicyType } from "@/types/PolicyType";
import type { PolicyWithId } from "@/types/PolicyTypeWithId";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PolicyState {
  policies: PolicyWithId[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
}

const initialState: PolicyState = {
  policies: [],
  loading: false,
  error: null,
  saving: false,
  saveError: null,
};

/**
 * Async thunk to fetch all policies for the current user
 */
export const fetchPolicies = createAsyncThunk(
  "policy/fetchPolicies",
  async (_, { rejectWithValue }) => {
    const result = await getPolicies();

    if (!result.success) {
      return rejectWithValue(result.error.code);
    }
    return result.data;
  }
);

/**
 * Async thunk to save a new policy
 */
export const createPolicy = createAsyncThunk(
  "policy/createPolicy",
  async (policy: PolicyType, { rejectWithValue }) => {
    const result = await savePolicy(policy);

    if (!result.success) {
      return rejectWithValue(result.error);
    }

    return {
      id: result.data,
      ...policy,
    };
  }
);

const policySlice = createSlice({
  name: "policy",
  initialState,
  reducers: {
    /**
     * Clear all policies from state
     */
    clearPolicies: (state) => {
      state.policies = [];
      state.loading = false;
      state.error = null;
    },
    /**
     * Clear any save errors
     */
    clearSaveError: (state) => {
      state.saveError = null;
    },
    /**
     * Clear any fetch errors
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * Add a policy to the state (useful for optimistic updates)
     */
    addPolicy: (state, action: PayloadAction<PolicyWithId>) => {
      state.policies.push(action.payload);
    },
    /**
     * Remove a policy from the state by ID
     */
    removePolicy: (state, action: PayloadAction<string>) => {
      state.policies = state.policies.filter(
        (policy) => policy.id !== action.payload
      );
    },
    /**
     * Update a policy in the state
     */
    updatePolicy: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<PolicyType> }>
    ) => {
      const index = state.policies.findIndex(
        (policy) => policy.id === action.payload.id
      );
      if (index !== -1) {
        state.policies[index] = {
          ...state.policies[index],
          ...action.payload.changes,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch policies
    builder.addCase(fetchPolicies.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPolicies.fulfilled, (state, action) => {
      state.loading = false;
      state.policies = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPolicies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create policy
    builder.addCase(createPolicy.pending, (state) => {
      state.saving = true;
      state.saveError = null;
    });
    builder.addCase(createPolicy.fulfilled, (state, action) => {
      state.saving = false;
      state.policies.push(action.payload);
      state.saveError = null;
    });
    builder.addCase(createPolicy.rejected, (state, action) => {
      state.saving = false;
      const error = action.payload as {
        code: string;
        details?: Record<string, string[]>;
      };
      state.saveError = error.code;
    });
  },
});

export const {
  clearPolicies,
  clearSaveError,
  clearError,
  addPolicy,
  removePolicy,
  updatePolicy,
} = policySlice.actions;

export default policySlice.reducer;
