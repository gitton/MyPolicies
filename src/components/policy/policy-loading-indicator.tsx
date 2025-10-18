import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PolicyLoadingIndicatorProps {
  testID?: string;
}

export function PolicyLoadingIndicator({
  testID,
}: PolicyLoadingIndicatorProps) {
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  return (
    <SafeAreaView
      testID={testID}
      style={[styles.container, { backgroundColor }]}
    >
      <ActivityIndicator
        testID="home-screen.progress-bar"
        size="large"
        color={tintColor}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
