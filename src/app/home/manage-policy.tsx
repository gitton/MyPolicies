import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedDateDisplay } from "@/components/ui/themed-date-display";
import { ThemedTextInput } from "@/components/ui/themed-text-input";
import { POLICY_SAVE_ERROR_CODE } from "@/features/data/savePolicy";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useThemeColor } from "@/hooks/useThemeColor";
import useUnmountSignal from "@/hooks/useUnmountSignal";
import { createPolicy, updateExistingPolicy } from "@/state/slices/policySlice";
import type { PolicyType } from "@/types/PolicyType";
import { PolicyCategory } from "@/types/PolicyType";
import { isPolicySaveError } from "@/types/SaveError";
import { addYears } from "@/utils/addYears";
import { policySchema } from "@/validation/policySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AndroidNativeProps,
  default as DateTimePicker,
  DateTimePickerAndroid,
  default as RNDateTimePicker,
} from "@react-native-community/datetimepicker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
 * Validate edit policy functionality in e2e tests
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

  const { policyId } = useLocalSearchParams<{ policyId?: string }>();
  const policies = useAppSelector((state) => state.policy.policies);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PolicyType>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      provider: "",
      policyNumber: "",
      premium: "",
      startDate: new Date(),
      endDate: addYears(new Date(), 1),
      policyType: "car",
    },
  });

  React.useEffect(() => {
    if (policyId) {
      const policyToEdit = policies.find((policy) => policy.id === policyId);

      if (policyToEdit) {
        reset({
          provider: policyToEdit.provider,
          policyNumber: policyToEdit.policyNumber,
          premium: policyToEdit.premium,
          startDate: policyToEdit.startDate,
          endDate: policyToEdit.endDate,
          policyType: policyToEdit.policyType,
        });
      } else {
        router.back();
      }
    }
  }, []);

  const onSubmit = async (data: PolicyType) => {
    try {
      if (policyId) {
        await dispatch(
          updateExistingPolicy({ policy: data, policyId })
        ).unwrap();
      } else {
        await dispatch(createPolicy(data)).unwrap();
      }

      if (unmountSignal.aborted) {
        return;
      }

      router.back();
    } catch (error) {
      if (unmountSignal.aborted) {
        return;
      }

      if (isPolicySaveError(error)) {
        switch (error.code) {
          case "UNAUTHENTICATED":
            router.replace("/auth/login");
            break;
          case "VALIDATION_ERROR":
            setErrorMessage(savePolicyErrorMessage[error.code]);
            break;
          case "UNKNOWN_ERROR":
            setErrorMessage(savePolicyErrorMessage[error.code]);
            break;
          default:
            const _exhaustiveCheck: never = error.code;
            throw new Error(`Unhandled error code: ${_exhaustiveCheck}`);
        }
      }
    }
  };

  //Test this

  const onOpenDatePickerAndroid = (
    date: Date,
    setDate: (date: Date) => void,
    minimumDate?: Date
  ) => {
    const params: AndroidNativeProps = {
      value: date,
      mode: "date",
      display: "default",
      minimumDate: minimumDate,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          setDate(selectedDate);
        }
      },
    };
    DateTimePickerAndroid.open(params);
  };

  const startDate = useWatch({ control, name: "startDate" });

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
          headerTitle: () => (
            <ThemedText role="heading">
              {policyId ? "Edit Policy" : "Add Policy"}
            </ThemedText>
          ),
          headerRight: () => (
            <Button
              title={policyId ? "Save" : "Add"}
              onPress={handleSubmit(onSubmit)}
            />
          ),
        }}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={[[{ backgroundColor }, styles.container]]}
      >
        <ThemedView style={styles.container}>
          <Controller
            control={control}
            name="policyType"
            render={({ field: { onChange, value } }) => (
              <SegmentedControl
                values={[
                  ...listOfSupportedPolicyCategories.map(
                    (category) => policyCategoryLabels[category]
                  ),
                ]}
                selectedIndex={listOfSupportedPolicyCategories.indexOf(value)}
                onChange={(event) => {
                  onChange(
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
            )}
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
            <Controller
              control={control}
              name="startDate"
              render={({ field: { value, onChange } }) =>
                Platform.OS === "ios" ? (
                  <RNDateTimePicker
                    value={value}
                    testID="manage-policy-screen.start-date-picker"
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (event.type === "set" && selectedDate) {
                        onChange(selectedDate);
                      }
                    }}
                  />
                ) : (
                  <ThemedDateDisplay
                    date={value}
                    testID="manage-policy-screen.start-date-display"
                    onPress={() => onOpenDatePickerAndroid(value, onChange)}
                  />
                )
              }
            />
          </View>
          <View style={styles.dateContainer}>
            <ThemedText style={styles.label}>End Date</ThemedText>
            <Controller
              control={control}
              name="endDate"
              render={({ field: { value, onChange } }) =>
                Platform.OS === "ios" ? (
                  <DateTimePicker
                    value={value}
                    testID="manage-policy-screen.end-date-picker"
                    mode="date"
                    display="default"
                    minimumDate={startDate}
                    onChange={(event, selectedDate) => {
                      if (event.type === "set" && selectedDate) {
                        onChange(selectedDate);
                      }
                    }}
                  />
                ) : (
                  <ThemedDateDisplay
                    date={value}
                    testID="manage-policy-screen.end-date-display"
                    onPress={() =>
                      onOpenDatePickerAndroid(value, onChange, startDate)
                    }
                  />
                )
              }
            />
          </View>
          {errors.endDate && (
            <ThemedText style={styles.errorMessage} role="alert">
              {errors.endDate.message}
            </ThemedText>
          )}
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
