import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PolicyErrorDisplayProps {}

export function PolicyErrorDisplay({}: PolicyErrorDisplayProps) {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedText role="alert" style={styles.errorText}>
        Unable to load your policies, please try again later
      </ThemedText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "red",
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
});
