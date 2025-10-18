# Policy Slice Usage Guide

This document provides examples of how to use the policy slice in your application.

## Basic Usage

Use Redux hooks directly to interact with the policy slice:

```tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchPolicies, createPolicy } from "@/state/slices/policySlice";

function PolicyListComponent() {
  const dispatch = useAppDispatch();
  
  // Select state from Redux store
  const { policies, loading, error } = useAppSelector((state) => state.policy);

  // Load policies on mount
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        await dispatch(fetchPolicies()).unwrap();
        // Success - policies are now in Redux state
      } catch (error) {
        // Handle error
        console.error("Failed to load policies:", error);
      }
    };

    loadPolicies();
  }, [dispatch]);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      {policies.map(policy => (
        <View key={policy.id}>
          <Text>{policy.provider}</Text>
          <Text>{policy.policyNumber}</Text>
        </View>
      ))}
    </View>
  );
}
```

## Creating a Policy with Error Handling

Use `.unwrap()` for cleaner error handling with try/catch:

```tsx
import { useAppDispatch } from "@/hooks/hooks";
import { createPolicy } from "@/state/slices/policySlice";
import { POLICY_SAVE_ERROR_CODE } from "@/features/data/savePolicy";

function CreatePolicyComponent() {
  const dispatch = useAppDispatch();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (policyData: PolicyType) => {
    try {
      // .unwrap() throws an error if the thunk is rejected
      await dispatch(createPolicy(policyData)).unwrap();
      
      // Success!
      router.replace("/home");
    } catch (error) {
      // Error is the value passed to rejectWithValue()
      const errorPayload = error as {
        code: POLICY_SAVE_ERROR_CODE;
        details?: Record<string, string[]>;
      };

      switch (errorPayload.code) {
        case "UNAUTHENTICATED":
          router.replace("/auth/login");
          break;
        case "VALIDATION_ERROR":
          setErrorMessage("Please check form fields and try again");
          break;
        case "UNKNOWN_ERROR":
          setErrorMessage("Please try again later or contact support");
          break;
        default:
          // Exhaustive check ensures all codes are handled
          const _exhaustiveCheck: never = errorPayload.code;
          throw new Error(`Unhandled error code: ${_exhaustiveCheck}`);
      }
    }
  };

  return (
    <View>
      {/* Your form here */}
      {errorMessage && <Text>{errorMessage}</Text>}
    </View>
  );
}
```

## Handling Component Unmount

Prevent state updates after component unmounts:

```tsx
import useUnmountSignal from "@/hooks/useUnmountSignal";

function MyComponent() {
  const dispatch = useAppDispatch();
  const unmountSignal = useUnmountSignal();

  const handleSave = async (policyData: PolicyType) => {
    try {
      await dispatch(createPolicy(policyData)).unwrap();
      
      // Check if component is still mounted before navigation
      if (unmountSignal.aborted) {
        return;
      }
      
      router.replace("/home");
    } catch (error) {
      // Check if component is still mounted before showing errors
      if (unmountSignal.aborted) {
        return;
      }
      
      // Handle error...
    }
  };
}
```

## Using Synchronous Actions

For immediate state updates without API calls:

```tsx
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  addPolicy,
  updatePolicy,
  removePolicy,
  clearPolicies,
  clearError,
  clearSaveError,
} from "@/state/slices/policySlice";

function PolicyManagement() {
  const dispatch = useAppDispatch();
  const { policies } = useAppSelector((state) => state.policy);

  // Add a policy optimistically (before API call completes)
  const addOptimistically = () => {
    dispatch(addPolicy({
      id: "temp-id",
      provider: "Provider",
      policyNumber: "POL-123",
      premium: "100.00",
      startDate: new Date(),
      endDate: new Date(),
      policyType: "car",
    }));
  };

  // Update an existing policy in state
  const updateExisting = (id: string) => {
    dispatch(updatePolicy({
      id,
      changes: { premium: "150.00" }
    }));
  };

  // Remove a policy from state
  const remove = (id: string) => {
    dispatch(removePolicy(id));
  };

  // Clear all policies
  const clearAll = () => {
    dispatch(clearPolicies());
  };

  // Clear errors
  const clearErrors = () => {
    dispatch(clearError());
    dispatch(clearSaveError());
  };

  return (
    // Your component JSX
  );
}
```

## Available Actions

### Async Thunks (API Calls)

- **`fetchPolicies()`** - Fetches all policies for the current user
  - Returns: `PolicyWithId[]`
  - Rejects with: error code string
  
- **`createPolicy(policy: PolicyType)`** - Creates a new policy
  - Returns: `PolicyWithId` (the created policy with ID)
  - Rejects with: `{ code: POLICY_SAVE_ERROR_CODE, details?: Record<string, string[]> }`

### Synchronous Actions

- **`clearPolicies()`** - Clears all policies from state
- **`clearSaveError()`** - Clears any save errors
- **`clearError()`** - Clears any fetch errors
- **`addPolicy(policy: PolicyWithId)`** - Adds a policy to state (for optimistic updates)
- **`removePolicy(id: string)`** - Removes a policy from state by ID
- **`updatePolicy({ id: string, changes: Partial<PolicyType> })`** - Updates a policy in state

## State Structure

```typescript
interface PolicyState {
  policies: PolicyWithId[];  // Array of policies with IDs
  loading: boolean;          // True when fetching policies
  error: string | null;      // Error code from fetch operation
  saving: boolean;           // True when saving a policy
  saveError: string | null;  // Error code from save operation
}
```

## Error Codes

### Fetch Error Codes
- `UNAUTHENTICATED` - User is not authenticated

### Save Error Codes
- `UNAUTHENTICATED` - User is not authenticated
- `VALIDATION_ERROR` - Policy data failed validation
- `UNKNOWN_ERROR` - An unexpected error occurred

## Best Practices

1. **Always use `.unwrap()`** for async thunks when you need error handling
2. **Check `unmountSignal.aborted`** before state updates in async operations
3. **Use exhaustive type checking** in switch statements for error codes
4. **Select only the state you need** from Redux to avoid unnecessary re-renders
5. **Call hooks at the component level**, never inside callbacks or async functions
