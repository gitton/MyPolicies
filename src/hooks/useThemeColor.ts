/**
 * A React Hook that returns the appropriate color value based on the current theme.
 *
 * This hook provides a convenient way to access theme-aware colors throughout the application.
 * It first checks if a custom color is provided via props for the current theme, and falls back
 * to the default color from the theme configuration if no custom color is specified.
 *
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 *
 * @param props - Object containing optional light and dark theme color overrides
 * @param colorName - The name of the color to retrieve from the theme configuration
 * @returns The color value for the current theme, either from props or theme configuration
 *
 * @example
 * ```tsx
 * const backgroundColor = useThemeColor(
 *   { light: '#ffffff', dark: '#000000' },
 *   'background'
 * );
 *
 * // Or use default theme colors
 * const textColor = useThemeColor({}, 'text');
 * ```
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "react-native";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
