import React from "react";
import { View } from "react-native";

/**
 * Mock implementation for expo-router Stack component
 *
 * This mock allows testing of Stack.Screen options including:
 * - headerTitle (renders custom components)
 * - headerRight (renders buttons/actions)
 * - headerLeft (renders back buttons/custom components)
 * - Other header options
 *
 * Usage in tests:
 *
 * jest.mock("expo-router", () => require("@/test-utils/mocks/expo-router"));
 */

interface StackScreenOptions {
  headerTitle?: string | (() => React.ReactElement);
  headerRight?: () => React.ReactElement;
  headerLeft?: () => React.ReactElement;
  headerStyle?: any;
  headerTitleStyle?: any;
  headerTintColor?: string;
  [key: string]: any;
}

interface StackScreenProps {
  children?: React.ReactNode;
  options?: StackScreenOptions;
  [key: string]: any;
}

interface StackProps {
  children: React.ReactNode;
  [key: string]: any;
}

// Store the latest Stack.Screen options for testing
let latestScreenOptions: StackScreenOptions = {};

/**
 * Get the latest Stack.Screen options
 * Useful for testing header configurations
 */
export const getLatestScreenOptions = () => latestScreenOptions;

/**
 * Reset stored screen options
 * Call this in beforeEach to ensure clean state
 */
export const resetScreenOptions = () => {
  latestScreenOptions = {};
};

/**
 * Mock Stack.Screen component
 * Renders header elements from options so they can be tested
 */
const StackScreen = ({
  children,
  options = {},
  ...props
}: StackScreenProps) => {
  // Store options for potential inspection
  latestScreenOptions = options;

  // Extract header elements from options
  const { headerTitle, headerRight, headerLeft } = options;

  return (
    <>
      {/* Render mock header with testable elements */}
      <View>
        {/* Render header left */}
        {headerLeft && (
          <View>{typeof headerLeft === "function" ? headerLeft() : null}</View>
        )}

        {/* Render header title */}
        {headerTitle && (
          <View>
            {typeof headerTitle === "function" ? headerTitle() : headerTitle}
          </View>
        )}

        {/* Render header right */}
        {headerRight && (
          <View>
            {typeof headerRight === "function" ? headerRight() : null}
          </View>
        )}
      </View>

      {/* Render the actual screen content */}
      {children || null}
    </>
  );
};

/**
 * Mock Stack component
 * Wraps children in a ScrollView for test compatibility
 */
const Stack = ({ children, ...props }: StackProps) => {
  const { ScrollView } = require("react-native");
  return <ScrollView {...props}>{children}</ScrollView>;
};

// Attach Screen as a property of Stack (matching expo-router API)
Stack.Screen = StackScreen;

// Mock router object
export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
};

// Mock useRouter hook
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
}));

// Mock other hooks
export const usePathname = jest.fn(() => "/");
export const useSegments = jest.fn(() => []);
export const useLocalSearchParams = jest.fn(() => ({}));
export const useGlobalSearchParams = jest.fn(() => ({}));

// Export the complete mock
export { Stack };

// Default export for jest.mock
export default {
  Stack,
  router,
  useRouter,
  usePathname,
  useSegments,
  useLocalSearchParams,
  useGlobalSearchParams,
};
