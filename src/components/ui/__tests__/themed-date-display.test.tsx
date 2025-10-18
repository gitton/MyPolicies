import { ThemedDateDisplay } from "@/components/ui/themed-date-display";
import { renderWithProviders } from "@/test-utils/renderWithProvider";
import { fireEvent, screen } from "@testing-library/react-native";
import React from "react";

describe("ThemedDateDisplay", () => {
  const testDate = new Date("2025-10-16");

  it("should render date and testId in correct format", () => {
    renderWithProviders(
      <ThemedDateDisplay
        date={testDate}
        testID="themed-date-display"
        onPress={() => {}}
      />
    );

    expect(screen.getByText("16 Oct 2025")).toBeOnTheScreen();
    expect(screen.getByTestId("themed-date-display")).toBeOnTheScreen();
  });

  it("should render and call onPress when pressed", () => {
    const mockOnPress = jest.fn();
    renderWithProviders(
      <ThemedDateDisplay
        date={testDate}
        testID="themed-date-display"
        onPress={mockOnPress}
      />
    );

    fireEvent.press(screen.getByTestId("themed-date-display"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
