import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  SIGN_IN_WITH_ERROR_CODE,
  signInWithEmailPassword,
} from "@/features/auth/signInWithEmailPassword";
import { useThemeColor } from "@/hooks/useThemeColor";
import useUnmountSignal from "@/hooks/useUnmountSignal";
import { loginSchema, LoginType } from "@/validation/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
/**
 * TODO:
 * Add Create Account Button and redirect to Create Account Screen
 * Add Forgot Password Button and redirect to Forgot Password Screen
 */

// Error messages mapped to Firebase auth error codes
const loginErrorMessage: Record<SIGN_IN_WITH_ERROR_CODE, string> = {
  NO_NETWORK_ERROR: "please make sure you are connected to the internet",
  AUTH_INVALID_CREDENTIALS: "please check your email and password is correct",
  UNKNOWN_ERROR: "please try again later or contact support",
};

export default function LoginScreen() {
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  // Component state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const unmountSignal = useUnmountSignal();
  // Form handling with validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
  });

  // Handle login form submission
  const handleLogin: SubmitHandler<LoginType> = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    const result = await signInWithEmailPassword(data.email, data.password);

    // Check if component unmounted during async operation
    if (unmountSignal.aborted) {
      return;
    }

    if (result.success === false) {
      setErrorMessage(loginErrorMessage[result.error.code]);
    } else {
      router.replace("/home");
    }
    setIsLoading(false);
  };

  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={[[{ backgroundColor }, styles.container]]}
      >
        <ThemedView style={styles.container}>
          <ThemedText role="heading" style={styles.heading}>
            My Policies
          </ThemedText>
          {/* Email input field */}
          <Controller
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: textColor },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={textColor + "80"}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                />
              </View>
            )}
            name="email"
          />
          {/* Email validation error */}
          {errors.email && (
            <Text role="alert" style={styles.errorMessage}>
              Please enter a valid email address
            </Text>
          )}

          {/* Password input field */}
          <Controller
            control={control}
            render={({ field: { onChange, value, onBlur } }) => (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { color: textColor, borderColor: textColor },
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={textColor + "80"}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  accessibilityLabel="Password"
                  autoCapitalize="none"
                  autoComplete="off"
                />
              </View>
            )}
            name="password"
          />
          {/* Password validation error */}
          {errors.password && (
            <Text role="alert" style={styles.errorMessage}>
              Password must be at least 6 characters
            </Text>
          )}

          {/* Login button */}
          <Pressable
            style={[styles.button, { backgroundColor: tintColor }]}
            role="button"
            disabled={isLoading}
            onPress={handleSubmit(handleLogin)}
          >
            <ThemedText
              style={[styles.loginButtonText, { color: backgroundColor }]}
            >
              Log In
            </ThemedText>
          </Pressable>

          {/* Loading indicator */}
          {isLoading && (
            <ActivityIndicator testID="login-screen.progress-bar" />
          )}

          {/* Authentication error message */}
          {errorMessage && (
            <Text role="alert" style={styles.errorMessage}>
              {errorMessage}
            </Text>
          )}
        </ThemedView>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
}

// Component styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
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
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});
