import ManagePolicyScreen from "@/app/home/manage-policy";
import { savePolicy } from "@/features/data/savePolicy";
import { renderWithProvidersAsync } from "@/test-utils/renderWithProvider";
import { PolicyWithId } from "@/types/PolicyTypeWithId";
import { screen, userEvent } from "@testing-library/react-native";
import { UserEventInstance } from "@testing-library/react-native/build/user-event/setup";
import { router, useLocalSearchParams } from "expo-router";

jest.mock("expo-router", () => require("@/test-utils/mocks/expo-router"));

// Mock react-native-keyboard-controller
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: ({ children, ...props }: any) => {
    const { ScrollView } = require("react-native");
    return <ScrollView {...props}>{children}</ScrollView>;
  },
  KeyboardToolbar: () => null,
}));

//Mock Save Policy Functionality
jest.mock("@/features/data/savePolicy", () => ({
  savePolicy: jest.fn(),
}));

describe("ManagePolicyScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Default mock implementation for savePolicy
    (savePolicy as jest.Mock).mockResolvedValue({
      success: true,
      data: "mock-policy-id",
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      policyId: undefined,
    });
  });

  describe("Rendering", () => {
    it("should render screen with header title 'Add Policy', button add and form elements for policy types 'Car, Van, Motorbike, and House', provider name, policy number, start date picker, end date picker, premium", async () => {
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      expect(
        screen.getByTestId("manage-policy-screen.policy-type-segmented-control")
      ).toBeOnTheScreen();
      expect(screen.getByText("Provider")).toBeOnTheScreen();
      expect(screen.getByText("Policy Number")).toBeOnTheScreen();
      expect(screen.getByText("Start Date")).toBeOnTheScreen();
      expect(screen.getByText("End Date")).toBeOnTheScreen();
      expect(screen.getByText("Premium")).toBeOnTheScreen();
      expect(
        screen.getByTestId("manage-policy-screen.end-date-picker")
      ).toBeOnTheScreen();
      expect(
        screen.getByTestId("manage-policy-screen.start-date-picker")
      ).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Add" })).toBeOnTheScreen();
      expect(
        screen.getByRole("heading", { name: "Add Policy" })
      ).toBeOnTheScreen();
    });

    it("should render screen with place holder for provider, policy number, premium", async () => {
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      expect(
        screen.getByPlaceholderText("Enter your provider name")
      ).toBeOnTheScreen();
      expect(
        screen.getByPlaceholderText("Enter your policy number")
      ).toBeOnTheScreen();
    });

    it("should render screen with numeric type keyboard for premium input", async () => {
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const premiumInput = screen.getByPlaceholderText(
        "Enter your premium amount"
      );
      expect(premiumInput.props.keyboardType).toBe("numeric");
    });
  });

  describe("Interactions", () => {
    it("should show error 'Provider name is required' when provider input is empty and form is submitted", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", { name: "Provider name is required" })
      ).toBeOnTheScreen();
    });

    it("should show error 'Provider name is too long' when provider input exceeds 100 characters", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      const longProviderName = "a".repeat(101);

      await user.type(providerInput, longProviderName);

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", { name: "Provider name is too long" })
      ).toBeOnTheScreen();
    });

    it("should show error 'Policy number is required' when policy number input is empty and form is submitted", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", { name: "Policy number is required" })
      ).toBeOnTheScreen();
    });

    it("should show error 'Policy number is too long' when policy number input exceeds 50 characters", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      const longPolicyNumber = "a".repeat(51);
      await user.type(policyNumberInput, longPolicyNumber);

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", { name: "Policy number is too long" })
      ).toBeOnTheScreen();
    });

    it("should show error 'Policy number must contain only letters, numbers, and hyphens' when policy number contains invalid characters", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      await user.type(policyNumberInput, "POLICY@123");

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", {
          name: "Policy number must contain only letters, numbers, and hyphens",
        })
      ).toBeOnTheScreen();
    });

    it("should show error 'Premium amount is required' when premium input is empty and form is submitted", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      await user.type(policyNumberInput, "POL123");

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", { name: "Premium amount is required" })
      ).toBeOnTheScreen();
    });

    it("should show error 'Premium must be a valid amount' when premium input contains invalid format", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      await user.type(policyNumberInput, "POL123");

      const premiumInput = screen.getByPlaceholderText(
        "Enter your premium amount"
      );
      await user.type(premiumInput, "abc");

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", {
          name: "Premium must be a valid amount (e.g., 123.45)",
        })
      ).toBeOnTheScreen();
    });

    it("should show error 'Premium must be a valid amount' when premium input has more than 2 decimal places", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      await user.type(policyNumberInput, "POL123");

      const premiumInput = screen.getByPlaceholderText(
        "Enter your premium amount"
      );
      await user.type(premiumInput, "123.456");

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", {
          name: "Premium must be a valid amount (e.g., 123.45)",
        })
      ).toBeOnTheScreen();
    });

    it("should clear validation errors when user corrects invalid input", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      // Submit form with empty fields to trigger validation errors
      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      expect(
        screen.getByRole("alert", { name: "Provider name is required" })
      ).toBeOnTheScreen();

      // Fill in valid provider name
      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      // Error should be cleared
      expect(
        screen.queryByRole("alert", { name: "Provider name is required" })
      ).not.toBeOnTheScreen();
    });

    it("should accept valid policy number with letters, numbers, and hyphens", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      await user.type(policyNumberInput, "POL-123-ABC");

      const premiumInput = screen.getByPlaceholderText(
        "Enter your premium amount"
      );
      await user.type(premiumInput, "123.45");

      const addButton = screen.getByRole("button", { name: "Add" });
      await user.press(addButton);

      // Should not show any validation errors
      expect(screen.queryByRole("alert")).not.toBeOnTheScreen();
      expect(savePolicy).toHaveBeenCalledTimes(1);
    });

    it("should accept valid premium amounts with different formats", async () => {
      const user = userEvent.setup();
      await renderWithProvidersAsync(<ManagePolicyScreen />);

      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      await user.type(policyNumberInput, "POL123");

      // Test different valid premium formats
      const validPremiums = ["123", "123.4", "123.45", "0.99"];

      for (const premium of validPremiums) {
        const premiumInput = screen.getByPlaceholderText(
          "Enter your premium amount"
        );
        await user.clear(premiumInput);
        await user.type(premiumInput, premium);

        const addButton = screen.getByRole("button", { name: "Add" });
        await user.press(addButton);

        // Should not show validation error for this premium format
        expect(
          screen.queryByRole("alert", {
            name: "Premium must be a valid amount",
          })
        ).not.toBeOnTheScreen();
      }
    });

    describe("Error handling with save Policy Functionality", () => {
      it("should route to login screen when user is not authenticated", async () => {
        (savePolicy as jest.Mock).mockResolvedValue({
          success: false,
          error: { code: "UNAUTHENTICATED" },
        });
        const user = userEvent.setup();
        await renderWithProvidersAsync(<ManagePolicyScreen />);

        await inputValidPolicyData(user);
        const addButton = screen.getByRole("button", { name: "Add" });
        await user.press(addButton);

        expect(savePolicy).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith("/auth/login");
      });

      it("should show error 'An unexpected error occurred' when savePolicy returns a failure result with VALIDATION_ERROR", async () => {
        (savePolicy as jest.Mock).mockResolvedValue({
          success: false,
          error: { code: "VALIDATION_ERROR" },
        });
        const user = userEvent.setup();
        await renderWithProvidersAsync(<ManagePolicyScreen />);

        await inputValidPolicyData(user);
        const addButton = screen.getByRole("button", { name: "Add" });
        await user.press(addButton);

        expect(savePolicy).toHaveBeenCalledTimes(1);
        expect(
          screen.getByRole("alert", {
            name: "please check form fields and try again",
          })
        ).toBeOnTheScreen();
      });

      it("should show error 'An unexpected error occurred' when savePolicy returns a failure result with UNKNOWN_ERROR", async () => {
        (savePolicy as jest.Mock).mockResolvedValue({
          success: false,
          error: { code: "UNKNOWN_ERROR" },
        });
        const user = userEvent.setup();
        await renderWithProvidersAsync(<ManagePolicyScreen />);

        await inputValidPolicyData(user);
        const addButton = screen.getByRole("button", { name: "Add" });
        await user.press(addButton);

        expect(savePolicy).toHaveBeenCalledTimes(1);
        expect(
          screen.getByRole("alert", {
            name: "please try again later or contact support",
          })
        ).toBeOnTheScreen();
      });

      it("should shoud navigate to home screen when savePolicy returns a success result", async () => {
        (savePolicy as jest.Mock).mockResolvedValue({
          success: true,
          data: "mock-policy-id",
        });
        const user = userEvent.setup();
        await renderWithProvidersAsync(<ManagePolicyScreen />);

        await inputValidPolicyData(user);
        const addButton = screen.getByRole("button", { name: "Add" });
        await user.press(addButton);

        expect(screen.queryByRole("alert")).not.toBeOnTheScreen();
        expect(savePolicy).toHaveBeenCalledTimes(1);
        expect(router.back).toHaveBeenCalledTimes(1);
      });
    });

    describe("Load Existing Policy", () => {
      it("should pre-populate form fields when policy id is provided in search params", async () => {
        const policyId = "2";
        (useLocalSearchParams as jest.Mock).mockReturnValue({ policyId });
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
        await renderWithProvidersAsync(<ManagePolicyScreen />, {
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

        // Assert header title changes to "Edit Policy"
        expect(
          screen.getByRole("heading", { name: "Edit Policy" })
        ).toBeOnTheScreen();

        expect(
          screen.getByDisplayValue("Home Insurance Ltd")
        ).toBeOnTheScreen();

        // Assert policy number is pre-populated
        expect(screen.getByDisplayValue("POL-002")).toBeOnTheScreen();

        // Assert premium is pre-populated
        expect(screen.getByDisplayValue("1200.00")).toBeOnTheScreen();
      });

      it("should save changes for an existing policy when form is submitted", async () => {
        const policyId = "2";
        (useLocalSearchParams as jest.Mock).mockReturnValue({ policyId });
        const mockPolicies: PolicyWithId[] = [
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
        const user = userEvent.setup();

        await renderWithProvidersAsync(<ManagePolicyScreen />, {
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

        const saveButton = screen.getByRole("button", { name: "Save" });
        await user.press(saveButton);

        expect(savePolicy).toHaveBeenCalledTimes(1);
        expect(savePolicy).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: "Home Insurance Ltd",
            policyNumber: "POL-002",
            premium: "1200.00",
            policyType: "house",
          }),
          policyId
        );
        expect(router.back).toHaveBeenCalledTimes(1);
      });

      it("should route to home screen, if policy id provided in search params but policy not found", async () => {
        const policyId = "3";
        (useLocalSearchParams as jest.Mock).mockReturnValue({ policyId });
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
        await renderWithProvidersAsync(<ManagePolicyScreen />, {
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

        // Assert header title changes to "Edit Policy"
        expect(
          screen.getByRole("heading", { name: "Edit Policy" })
        ).toBeOnTheScreen();

        expect(router.back).toHaveBeenCalledTimes(1);
      });
    });

    async function inputValidPolicyData(user: UserEventInstance) {
      const providerInput = screen.getByPlaceholderText(
        "Enter your provider name"
      );
      await user.type(providerInput, "Test Provider");

      const policyNumberInput = screen.getByPlaceholderText(
        "Enter your policy number"
      );
      await user.type(policyNumberInput, "POL12345");

      const premiumInput = screen.getByPlaceholderText(
        "Enter your premium amount"
      );
      await user.type(premiumInput, "123.45");
    }
  });
});
