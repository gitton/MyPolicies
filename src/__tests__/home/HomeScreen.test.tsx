import HomeScreen from "@/app/home/index";
import { getPolicies } from "@/features/data/getPolicies";
import {
  renderWithProviders,
  renderWithProvidersAsync,
} from "@/test-utils/renderWithProvider";
import { PolicyWithId } from "@/types/PolicyTypeWithId";
import { formatDateToShortMonth } from "@/utils/formatDateToShortMonth";
import { screen, userEvent } from "@testing-library/react-native";
import { router } from "expo-router";

/**
 * HomeScreen Component Tests
 *
 * Tests the home screen functionality including:
 * - UI rendering with different states (loading, error, empty, with data)
 * - Policy list display
 * - User interactions with policy cards
 * - Data fetching and error handling
 */

// Mock expo-router
jest.mock("expo-router", () => require("@/test-utils/mocks/expo-router"));

// Mock getPolicies function
jest.mock("@/features/data/getPolicies", () => ({
  getPolicies: jest.fn(),
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Default mock implementation for getPolicies
    (getPolicies as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
  });

  // Mock data for a policy
  const mockPolicy: PolicyWithId = {
    id: "1",
    policyType: "car",
    provider: "Geico",
    premium: "1000",
    startDate: new Date("2023-01-01T00:00:00.000Z"), // Use ISO string for consistent date handling
    endDate: new Date("2024-01-01T00:00:00.000Z"),
    policyNumber: "POL-001",
  };

  const policyTypeLabel = {
    car: "Car",
    house: "House",
    life: "Life",
    health: "Health",
    van: "Van",
    motorbike: "Motorbike",
    // ... other policy types
  };

  describe("Rendering", () => {
    it("should render loading indicator when loading policies for the first time", () => {
      renderWithProviders(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: true,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(
        screen.getByTestId("home-screen.policy-loading-indicator")
      ).toBeOnTheScreen();
    });

    it("should render empty state when no policies are available", async () => {
      (getPolicies as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(screen.getByText("No Policies Yet")).toBeOnTheScreen();
      expect(
        screen.getByText("Add your first policy to get started")
      ).toBeOnTheScreen();
    });

    it("should render error display when there is an error", async () => {
      const errorMessage = "UNKNOWN_ERROR";
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: false,
            error: errorMessage,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(
        screen.getByText("Unable to load your policies, please try again later")
      ).toBeOnTheScreen();
    });

    it("should render policy list when policies are available", async () => {
      const mockPolicies: PolicyWithId[] = [
        {
          id: "1",
          policyType: "car",
          provider: "Test Insurance Co",
          policyNumber: "POL-001",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          premium: "500.00",
        },
        {
          id: "2",
          policyType: "house",
          provider: "Home Insurance Ltd",
          policyNumber: "POL-002",
          startDate: new Date("2024-02-01"),
          endDate: new Date("2025-02-01"),
          premium: "1200.00",
        },
      ];

      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: mockPolicies,
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      // Verify policy cards are rendered
      expect(screen.getByText("Test Insurance Co")).toBeOnTheScreen();
      expect(screen.getByText("Car")).toBeOnTheScreen();
      expect(screen.getByText("POL-001")).toBeOnTheScreen();
      //start date 2024-01-01
      expect(screen.getByText("01 Jan 2024")).toBeOnTheScreen();
      //end date 2024-12-31
      expect(screen.getByText("31 Dec 2024")).toBeOnTheScreen();
      expect(screen.getByText("500.00")).toBeOnTheScreen();

      expect(screen.getByText("Home Insurance Ltd")).toBeOnTheScreen();
      expect(screen.getByText("House")).toBeOnTheScreen();
      expect(screen.getByText("POL-002")).toBeOnTheScreen();
      //start date 2024-02-01
      expect(screen.getByText("01 Feb 2024")).toBeOnTheScreen();
      //end date 2025-02-01
      expect(screen.getByText("01 Feb 2025")).toBeOnTheScreen();
      expect(screen.getByText("1200.00")).toBeOnTheScreen();

      //check for the a11y for the policy cards
    });

    it('should have an accessibility role of "button" for each policy card', async () => {
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [mockPolicy],
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });
      const policyCardButtons = screen.getAllByRole("button");
      expect(policyCardButtons.length).toBeGreaterThan(0); // Ensure at least one button is found
      policyCardButtons.forEach((button) => {
        expect(button).toBeOnTheScreen();
      });
    });

    it("should display the correct accessibility label with dynamically formatted dates for each policy card", async () => {
      const start = formatDateToShortMonth(mockPolicy.startDate);
      const end = formatDateToShortMonth(mockPolicy.endDate);

      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [mockPolicy],
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      const expectedLabel = `${
        policyTypeLabel[mockPolicy.policyType]
      } policy from ${mockPolicy.provider}, ${
        mockPolicy.premium
      } premium. Starts ${start}, ends ${end}.`;

      expect(screen.getByLabelText(expectedLabel)).toBeOnTheScreen();
    });

    it("should render with header My Policies as heading and add button on the screen", async () => {
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [mockPolicy],
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });
      expect(
        screen.getByRole("heading", { name: "My Policies" })
      ).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Add" })).toBeOnTheScreen();
    });
  });

  describe("Interactions", () => {
    it("should navigate to the manage policy screen when the add button is pressed", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [mockPolicy],
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(router.push).toHaveBeenCalledWith("/home/manage-policy");
    });
  });

  describe("Data Fetching", () => {
    it("should fetch policies on mount when policies array is empty", async () => {
      (getPolicies as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          {
            id: "1",
            policyType: "car",
            provider: "Test Provider",
            policyNumber: "POL-001",
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-12-31"),
            premium: "500.00",
          },
        ],
      });

      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      // Wait for the policies to be loaded
      expect(getPolicies).toHaveBeenCalledTimes(1);
    });

    it("should not fetch policies on mount when policies already exist", async () => {
      const mockPolicies: PolicyWithId[] = [
        {
          id: "1",
          policyType: "car",
          provider: "Existing Provider",
          policyNumber: "POL-001",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          premium: "500.00",
        },
      ];

      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: mockPolicies,
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(getPolicies).not.toHaveBeenCalled();
    });

    it("should not fetch policies when already loading", async () => {
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: true,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(getPolicies).not.toHaveBeenCalled();
    });

    it("should not fetch policies when there is an error", async () => {
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: false,
            error: "UNKNOWN_ERROR",
            saving: false,
            saveError: null,
          },
        },
      });

      expect(getPolicies).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when error state is UNKNOWN_ERROR", async () => {
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: false,
            error: "UNKNOWN_ERROR",
            saving: false,
            saveError: null,
          },
        },
      });

      expect(
        screen.getByText("Unable to load your policies, please try again later")
      ).toBeOnTheScreen();
    });

    it("should not show error when policies load successfully", async () => {
      const mockPolicies: PolicyWithId[] = [
        {
          id: "1",
          policyType: "car",
          provider: "Test Provider",
          policyNumber: "POL-001",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          premium: "500.00",
        },
      ];

      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: mockPolicies,
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(
        screen.queryByTestId("home-screen.policy-error-display")
      ).not.toBeOnTheScreen();
    });
  });

  describe("Loading States", () => {
    it("should show loading indicator only when loading and no policies exist", async () => {
      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: [],
            loading: true,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(
        screen.getByTestId("home-screen.policy-loading-indicator")
      ).toBeOnTheScreen();
    });

    it("should not show loading indicator when loading is false and policies exist", async () => {
      const mockPolicies: PolicyWithId[] = [
        {
          id: "1",
          policyType: "car",
          provider: "Test Provider",
          policyNumber: "POL-001",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          premium: "500.00",
        },
      ];

      await renderWithProvidersAsync(<HomeScreen />, {
        preloadedState: {
          policy: {
            policies: mockPolicies,
            loading: false,
            error: null,
            saving: false,
            saveError: null,
          },
        },
      });

      expect(
        screen.queryByTestId("home-screen.policy-loading-indicator")
      ).not.toBeOnTheScreen();
    });
  });
});
