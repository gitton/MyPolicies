import LoginScreen from "@/app/auth/login";
import { signInWithEmailPassword } from "@/features/auth/signInWithEmailPassword";
import { renderWithProviders } from "@/test-utils/renderWithProvider";
import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { UserEventInstance } from "@testing-library/react-native/build/user-event/setup";
import { router } from "expo-router";
/**
 * LoginScreen Component Tests
 *
 * Tests the login screen functionality including:
 * - UI rendering and accessibility
 * - Form validation (email/password)
 * - User interactions and error handling
 * - Authentication flow integration
 */

// Mock react-native-keyboard-controller
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: ({ children, ...props }: any) => {
    const { ScrollView } = require("react-native");
    return <ScrollView {...props}>{children}</ScrollView>;
  },
  KeyboardToolbar: () => null,
}));

//Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the signInWithEmailPassword function
jest.mock("@/features/auth/signInWithEmailPassword", () => ({
  signInWithEmailPassword: jest.fn(),
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // Test constants for validation messages
  const invalidEmailMessage = "Please enter a valid email address";
  const invalidPasswordMessage = "Password must be at least 6 characters";

  describe("Rendering", () => {
    it("should render login screen with heading, email input, password input and login button", () => {
      renderWithProviders(<LoginScreen />);

      expect(
        screen.getByRole("heading", { name: "My Policies" })
      ).toBeOnTheScreen();
      expect(screen.getByText("Email")).toBeOnTheScreen();
      expect(screen.getByText("Password")).toBeOnTheScreen();
      expect(screen.getByLabelText("Email")).toBeOnTheScreen();
      expect(screen.getByLabelText("Password")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Log In" })).toBeOnTheScreen();
      expect(
        screen.queryByText("Email and password are required")
      ).not.toBeOnTheScreen();
    });

    it("should have proper placeholder text for email and password inputs", () => {
      renderWithProviders(<LoginScreen />);

      expect(screen.getByPlaceholderText("Enter your email")).toBeOnTheScreen();
      expect(
        screen.getByPlaceholderText("Enter your password")
      ).toBeOnTheScreen();
    });

    it("should have secure text entry for password input", () => {
      renderWithProviders(<LoginScreen />);

      const passwordInput = screen.getByPlaceholderText("Enter your password");
      expect(passwordInput).toBeOnTheScreen();
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it("should not auto capitalize text for password input and email input", () => {
      renderWithProviders(<LoginScreen />);

      const passwordInput = screen.getByPlaceholderText("Enter your password");
      const emailInput = screen.getByPlaceholderText("Enter your email");

      expect(passwordInput).toBeOnTheScreen();
      expect(passwordInput.props.autoCapitalize).toBe("none");
      expect(emailInput.props.autoCapitalize).toBe("none");
    });

    it("should not auto complete text for password input", () => {
      renderWithProviders(<LoginScreen />);

      const passwordInput = screen.getByPlaceholderText("Enter your password");

      expect(passwordInput).toBeOnTheScreen();
      expect(passwordInput.props.autoComplete).toBe("off");
    });
  });

  describe("Interactions", () => {
    it("should show error message when login button is pressed with empty email and password", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await user.press(screen.getByRole("button", { name: "Log In" }));
      expect(
        screen.getByRole("alert", {
          name: invalidEmailMessage,
        })
      ).toBeOnTheScreen();
      expect(
        screen.getByRole("alert", {
          name: invalidPasswordMessage,
        })
      ).toBeOnTheScreen();
    });

    it("should show error message when entered invalid email and invalid password less than 6 characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "test");
      await user.type(
        screen.getByPlaceholderText("Enter your password"),
        "test"
      );
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(
        screen.getByRole("alert", {
          name: invalidEmailMessage,
        })
      ).toBeOnTheScreen();
      expect(
        screen.getByRole("alert", {
          name: invalidPasswordMessage,
        })
      ).toBeOnTheScreen();
    });

    it("should not show error message for email when entered valid email after a invalid email address input attempt", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "test");
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(
        screen.getByRole("alert", {
          name: invalidEmailMessage,
        })
      ).toBeOnTheScreen();

      await user.type(
        screen.getByPlaceholderText("Enter your email"),
        "test@gmail.com"
      );

      expect(
        screen.queryByRole("alert", {
          name: invalidEmailMessage,
        })
      ).not.toBeOnTheScreen();
    });

    it("should not show error message for password when entered valid password after a invalid password attempt", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await user.type(
        screen.getByPlaceholderText("Enter your password"),
        "test"
      );
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(
        screen.getByRole("alert", {
          name: invalidPasswordMessage,
        })
      ).toBeOnTheScreen();

      await user.type(
        screen.getByPlaceholderText("Enter your password"),
        "password"
      );

      expect(
        screen.queryByRole("alert", {
          name: invalidPasswordMessage,
        })
      ).not.toBeOnTheScreen();
    });

    it("should invoke signInWithEmailPassword when login button is pressed with valid email and password", async () => {
      (signInWithEmailPassword as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: "NO_NETWORK_ERROR" },
      });

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));

      //Verify
      expect(
        screen.queryByRole("alert", {
          name: "Please enter a valid email address",
        })
      ).not.toBeOnTheScreen();
      expect(
        screen.queryByRole("alert", {
          name: "Password must be at least 6 characters",
        })
      ).not.toBeOnTheScreen();
      expect(signInWithEmailPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );
    });

    it("should show activity indicator and login button disabled when signInWithEmailPassword is loading", async () => {
      (signInWithEmailPassword as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, data: { id: "1" } }), 200)
          )
      );

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(signInWithEmailPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );

      expect(screen.getByTestId("login-screen.progress-bar")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Log In" })).toBeDisabled();
    });

    it("should clear activity indicator and login button enabled, when signInWithEmailPassword is resolved", async () => {
      (signInWithEmailPassword as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, data: { id: "1" } }), 200)
          )
      );

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(signInWithEmailPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );
      await waitFor(() => {
        expect(
          screen.queryByTestId("login-screen.progress-bar")
        ).not.toBeOnTheScreen();
        expect(
          screen.queryByRole("button", { name: "Log In" })
        ).not.toBeDisabled();
      });
    });

    it("should clear error message when new signInWithEmailPassword is invoked after a failure result", async () => {
      (signInWithEmailPassword as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: { code: "NO_NETWORK_ERROR" },
      });
      (signInWithEmailPassword as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { id: "1" },
      });

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(signInWithEmailPassword).toHaveBeenCalledTimes(2);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );
      expect(
        screen.queryByRole("alert", {
          name: "please make sure you are connected to the internet",
        })
      ).not.toBeOnTheScreen();
    });

    it("should redirect to home screen when signInWithEmailPassword return success result", async () => {
      (signInWithEmailPassword as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: "1" },
      });

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));
      ``;
      expect(signInWithEmailPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );
      expect(router.replace).toHaveBeenCalledWith("/home");
    });
  });

  describe("Error Handling with SignInWithEmailPassword", () => {
    it("should show alert `please make sure you are connected to the internet` when signInWithEmailPassword return failure result with NO_NETWORK_ERROR", async () => {
      (signInWithEmailPassword as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: "NO_NETWORK_ERROR" },
      });

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(signInWithEmailPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );
      expect(
        screen.getByRole("alert", {
          name: "please make sure you are connected to the internet",
        })
      ).toBeOnTheScreen();
    });

    it("should show alert `please check your email and password is correct` when signInWithEmailPassword return failure result with AUTH_INVALID_CREDENTIALS", async () => {
      (signInWithEmailPassword as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: "AUTH_INVALID_CREDENTIALS" },
      });

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(signInWithEmailPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );
      expect(
        screen.getByRole("alert", {
          name: "please check your email and password is correct",
        })
      ).toBeOnTheScreen();
    });

    it("should show alert `please try again later or contact support` when signInWithEmailPassword return failure result with UNKNOWN_ERROR", async () => {
      (signInWithEmailPassword as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: "UNKNOWN_ERROR" },
      });

      const user = userEvent.setup();
      renderWithProviders(<LoginScreen />);

      await inputValidEmailAndPassword(user);
      await user.press(screen.getByRole("button", { name: "Log In" }));

      expect(signInWithEmailPassword).toHaveBeenCalledTimes(1);
      expect(signInWithEmailPassword).toHaveBeenCalledWith(
        "test@test.com",
        "password"
      );
      expect(
        screen.getByRole("alert", {
          name: "please try again later or contact support",
        })
      ).toBeOnTheScreen();
    });
  });

  // Helper function to input valid test credentials
  const inputValidEmailAndPassword = async (user: UserEventInstance) => {
    await user.type(
      screen.getByPlaceholderText("Enter your email"),
      "test@test.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password"
    );
  };
});
