import type { AppDispatch, RootState } from "@/state/store";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

/**
 * Typed Redux hooks for the application.
 *
 * These hooks provide type-safe access to the Redux store throughout the application.
 * They should be used instead of the plain `useDispatch` and `useSelector` hooks from
 * react-redux to ensure proper TypeScript typing and better developer experience.
 *
 * @example
 * ```tsx
 * const dispatch = useAppDispatch();
 * const user = useAppSelector(state => state.auth.user);
 * ```
 */

/**
 * A typed version of useDispatch that provides proper TypeScript support
 * for dispatching actions with the AppDispatch type.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * A typed version of useSelector that provides proper TypeScript support
 * for selecting state from the RootState type.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
