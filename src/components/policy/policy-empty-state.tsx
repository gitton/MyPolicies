import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export function PolicyEmptyState() {
  return (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>No Policies Yet</ThemedText>
      <ThemedText style={styles.emptySubText}>
        Add your first policy to get started
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
});
