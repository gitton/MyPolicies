import { useThemeColor } from "@/hooks/useThemeColor";
import { formatDateToShortMonth } from "@/utils/formatDateToShortMonth";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";

export interface ThemedDateDisplayProps {
  date: Date;
  testID: string;
  onPress: () => void;
}

export function ThemedDateDisplay({
  date,
  testID,
  onPress,
}: ThemedDateDisplayProps) {
  const backgroundColor = useThemeColor({}, "dateDisplayBackground");
  const textColor = useThemeColor({}, "dateDisplayText");

  return (
    <Pressable
      role="button"
      testID={testID}
      onPress={onPress}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedText style={[styles.dateText, { color: textColor }]}>
        {formatDateToShortMonth(date)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
