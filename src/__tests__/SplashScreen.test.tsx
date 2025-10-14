import Index from "@/app/index";
import { renderWithProviders } from "@/test-utils/renderWithProvider";
import { screen } from "@testing-library/react-native";
jest.mock("expo-router", () => ({
  Redirect: () => null,
}));

// Tests for splash screen component behavior during auth loading states

describe("Splash Screen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render name of the app my policies and a progress bar when the auth state is loading", () => {
    renderWithProviders(<Index />, {
      preloadedState: { auth: { loading: true, user: null } },
    });

    expect(
      screen.getByRole("heading", { name: "My Policies" })
    ).toBeOnTheScreen();
    expect(screen.getByTestId("splash-screen.progress-bar")).toBeOnTheScreen();
  });

  it("should not render name of the app my policies and a progress bar when the auth state is not loading", () => {
    renderWithProviders(<Index />, {
      preloadedState: { auth: { loading: false, user: null } },
    });
    expect(
      screen.queryByRole("heading", { name: "My Policies" })
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByTestId("splash-screen.progress-bar")
    ).not.toBeOnTheScreen();
  });
});
