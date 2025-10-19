import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { ThemedText } from "../themed-text";

interface ThemedTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: any;
}

export function ThemedTextInput({
  label,
  error,
  containerStyle,
  style,
  ...props
}: ThemedTextInputProps) {
  const textColor = useThemeColor({}, "text");
  const placeholderTextColor = useThemeColor({}, "placeholderTextColor");

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { color: textColor, borderColor: textColor },
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
      {error && (
        <ThemedText style={styles.errorMessage} role="alert">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "red",
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
});
