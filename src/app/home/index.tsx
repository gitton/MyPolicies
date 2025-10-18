import { PolicyCard } from "@/components/policy/policy-card";
import { PolicyEmptyState } from "@/components/policy/policy-empty-state";
import { PolicyErrorDisplay } from "@/components/policy/policy-error-display";
import { PolicyLoadingIndicator } from "@/components/policy/policy-loading-indicator";
import { ThemedText } from "@/components/themed-text";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fetchPolicies } from "@/state/slices/policySlice";
import { RootState } from "@/state/store";
import type { PolicyWithId } from "@/types/PolicyTypeWithId";
import { router, Stack } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  Button,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from "react-native";

/**
 * HomeScreen Component
 *
 * This component displays a list of policies for the current user.
 * It fetches policies from the database and displays them in a list.
 * It also allows the user to press a policy card to view the policy details.
 *
 * TODO:
 * - Route to edit policy screen on press policy card
 * - If user is not authenticated, redirect to login screen
 */

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { policies, loading, error } = useAppSelector(
    (state: RootState) => state.policy
  );

  //Theme colors
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  // All hooks must be called before any conditional returns
  const handlePolicyPress = useCallback((id: string) => {
    console.log("Policy pressed:", id);
  }, []);

  // Optimized render function
  const renderPolicyItem = useCallback(
    ({ item }: ListRenderItemInfo<PolicyWithId>) => (
      <PolicyCard policy={item} onPress={handlePolicyPress} />
    ),
    [handlePolicyPress]
  );

  // Optimized key extractor
  const keyExtractor = useCallback((item: PolicyWithId) => item.id, []);

  // Separator component
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  // Empty state
  const EmptyState = useCallback(() => <PolicyEmptyState />, []);

  // Fetch policies only once on mount if not already loaded
  useEffect(() => {
    if (policies.length === 0 && !loading && !error) {
      dispatch(fetchPolicies());
    }
  }, []);

  // Conditional returns AFTER all hooks
  if (loading) {
    return (
      <PolicyLoadingIndicator testID="home-screen.policy-loading-indicator" />
    );
  }

  if (error) {
    return <PolicyErrorDisplay />;
  }
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
            <ThemedText role="heading">My Policies</ThemedText>
          ),
          headerRight: () => (
            <Button
              title="Add"
              onPress={() => router.push("/home/manage-policy")}
            />
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor }]}>
        <FlatList
          data={policies}
          renderItem={renderPolicyItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={5}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: "red",
    padding: 20,
  },
});
