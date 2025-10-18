import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedDateDisplay } from "@/components/ui/themed-date-display";
import { ThemedTextInput } from "@/components/ui/themed-text-input";
import { POLICY_SAVE_ERROR_CODE } from "@/features/data/savePolicy";
import { useAppDispatch } from "@/hooks/hooks";
import { useThemeColor } from "@/hooks/useThemeColor";
import useUnmountSignal from "@/hooks/useUnmountSignal";
import { createPolicy } from "@/state/slices/policySlice";
import type { PolicyType } from "@/types/PolicyType";
import { PolicyCategory, PolicyFormData } from "@/types/PolicyType";
import { addYears } from "@/utils/addYears";
import { policyFormSchema } from "@/validation/policySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AndroidNativeProps,
  default as DateTimePicker,
  DateTimePickerAndroid,
  default as RNDateTimePicker,
} from "@react-native-community/datetimepicker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const listOfSupportedPolicyCategories: PolicyCategory[] = [
  "car",
  "van",
  "motorbike",
  "house",
];

const policyCategoryLabels: Record<PolicyCategory, string> = {
  car: "Car",
  van: "Van",
  motorbike: "Motorbike",
  house: "House",
};

/**
 * TODO:
 *
 * Add loading indicator when saving policy
 * Disable add button when saving policy
 * Validate start date and end date selection and error handling in e2e tests
 */

// Error messages mapped to saved policy
const savePolicyErrorMessage: Record<POLICY_SAVE_ERROR_CODE, string> = {
  UNAUTHENTICATED: "",
  VALIDATION_ERROR: "please check form fields and try again",
  UNKNOWN_ERROR: "please try again later or contact support",
};

export default function ManagePolicyScreen() {
  const unmountSignal = useUnmountSignal();
  const dispatch = useAppDispatch();

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => addYears(new Date(), 1));
  const [policyType, setPolicyType] = useState<PolicyCategory>(
    listOfSupportedPolicyCategories[0]
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const policyTypeIndex = listOfSupportedPolicyCategories.indexOf(policyType);
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      provider: "",
      policyNumber: "",
      premium: "",
    },
  });

  const onSubmit = async (data: PolicyFormData) => {
    // Convert form from PolicyFormData to PolicyType
    const policyData: PolicyType = {
      startDate: startDate,
      endDate: endDate,
      provider: data.provider,
      policyNumber: data.policyNumber,
      premium: data.premium,
      policyType: policyType,
    };

    try {
      await dispatch(createPolicy(policyData)).unwrap();

      if (unmountSignal.aborted) {
        return;
      }

      router.back();
    } catch (error) {
      if (unmountSignal.aborted) {
        return;
      }

      const errorPayload = error as {
        code: POLICY_SAVE_ERROR_CODE;
        details?: Record<string, string[]>;
      };

      switch (errorPayload.code) {
        case "UNAUTHENTICATED":
          router.replace("/auth/login");
          break;
        case "VALIDATION_ERROR":
          setErrorMessage(savePolicyErrorMessage[errorPayload.code]);
          break;
        case "UNKNOWN_ERROR":
          setErrorMessage(savePolicyErrorMessage[errorPayload.code]);
          break;
        default:
          const _exhaustiveCheck: never = errorPayload.code;
          throw new Error(`Unhandled error code: ${_exhaustiveCheck}`);
      }
    }
  };

  //Test this

  const onOpenDatePickerAndroid = (
    date: Date,
    setDate: (date: Date) => void
  ) => {
    const params: AndroidNativeProps = {
      value: date,
      mode: "date",
      display: "default",
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          setDate(selectedDate);
        }
      },
    };
    DateTimePickerAndroid.open(params);
  };

  const onChangeStartDate = (date: Date) => {
    setStartDate(date);
  };

  const onChangeEndDate = (date: Date) => {
    setEndDate(date);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTitleStyle: {
            color: textColor,
          },
          headerTintColor: textColor,
          headerTitle: () => <ThemedText role="heading">Add Policy</ThemedText>,
          headerRight: () => (
            <Button title="Add" onPress={handleSubmit(onSubmit)} />
          ),
        }}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={[[{ backgroundColor }, styles.container]]}
      >
        <ThemedView style={styles.container}>
          <SegmentedControl
            values={[
              ...listOfSupportedPolicyCategories.map(
                (category) => policyCategoryLabels[category]
              ),
            ]}
            selectedIndex={policyTypeIndex}
            onChange={(event) => {
              setPolicyType(
                listOfSupportedPolicyCategories[
                  event.nativeEvent.selectedSegmentIndex
                ]
              );
            }}
            style={styles.segmentedControl}
            tintColor={tintColor}
            backgroundColor={backgroundColor}
            fontStyle={{
              color: textColor,
            }}
            activeFontStyle={{
              color: backgroundColor,
            }}
            testID="manage-policy-screen.policy-type-segmented-control"
          />

          <Controller
            control={control}
            name="provider"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                label="Provider"
                placeholder="Enter your provider name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                accessibilityLabel="Provider"
                error={errors.provider?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="policyNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                label="Policy Number"
                placeholder="Enter your policy number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                accessibilityLabel="Policy Number"
                error={errors.policyNumber?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="premium"
            render={({ field: { onChange, onBlur, value } }) => (
              <ThemedTextInput
                label="Premium"
                placeholder="Enter your premium amount"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                accessibilityLabel="Premium"
                keyboardType="numeric"
                error={errors.premium?.message}
              />
            )}
          />

          <View style={styles.dateContainer}>
            <ThemedText style={styles.label}>Start Date</ThemedText>
            {Platform.OS === "ios" ? (
              <RNDateTimePicker
                value={startDate}
                testID="manage-policy-screen.start-date-picker"
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    onChangeStartDate(selectedDate);
                  }
                }}
              />
            ) : (
              <ThemedDateDisplay
                date={startDate}
                testID="manage-policy-screen.start-date-display"
                onPress={() =>
                  onOpenDatePickerAndroid(startDate, onChangeStartDate)
                }
              />
            )}
          </View>

          <View style={styles.dateContainer}>
            <ThemedText style={styles.label}>End Date</ThemedText>
            {Platform.OS === "ios" ? (
              <DateTimePicker
                value={endDate}
                testID="manage-policy-screen.end-date-picker"
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (event.type === "set" && selectedDate) {
                    onChangeEndDate(selectedDate);
                  }
                }}
              />
            ) : (
              <ThemedDateDisplay
                date={endDate}
                testID="manage-policy-screen.end-date-display"
                onPress={() =>
                  onOpenDatePickerAndroid(endDate, onChangeEndDate)
                }
              />
            )}
          </View>
          {/* Save Policy error message */}
          {errorMessage && (
            <Text role="alert" style={styles.errorMessage}>
              {errorMessage}
            </Text>
          )}
        </ThemedView>
      </KeyboardAwareScrollView>
    </>
  );
}

// Component styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonPressed: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: "400",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  segmentedControl: {
    height: 48,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});
