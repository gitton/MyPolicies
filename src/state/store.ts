import authReducer from "@/state/slices/authSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

// Root reducer combining all feature reducers
const rootReducer = combineReducers({
  auth: authReducer,
});

// Store factory function for testing with preloaded state
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

// Main application store instance
export const store = setupStore();

// TypeScript types for Redux store
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
