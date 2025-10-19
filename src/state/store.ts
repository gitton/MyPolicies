import authReducer from "@/state/slices/authSlice";
import policyReducer from "@/state/slices/policySlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

// Root reducer combining all feature reducers
const rootReducer = combineReducers({
  auth: authReducer,
  policy: policyReducer,
});

// Store factory function for testing with preloaded state
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore Date objects in actions and state since policies contain dates
          ignoredActions: [
            "policy/addPolicy",
            "policy/updatePolicy",
            "policy/createPolicy/fulfilled",
            "policy/fetchPolicies/fulfilled",
          ],
          ignoredActionPaths: [
            "payload.startDate",
            "payload.endDate",
            "meta.arg",
          ],
          ignoredPaths: ["policy.policies"],
        },
      }),
  });
}

// Main application store instance
export const store = setupStore();

// TypeScript types for Redux store
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
