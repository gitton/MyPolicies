import { useAppSelector } from "@/hooks/hooks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RootState } from "@/state/store";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const loading = useAppSelector((state: RootState) => state.auth.loading);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text role="heading" style={[styles.text, { color: textColor }]}>
          My Policies
        </Text>
        <ActivityIndicator
          testID="splash-screen.progress-bar"
          color={textColor}
        />
      </View>
    );
  }
  if (!user) {
    return <Redirect href="/auth/login" />;
  } else {
    return <Redirect href="/home" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 32,
    textAlign: "center",
  },
});
