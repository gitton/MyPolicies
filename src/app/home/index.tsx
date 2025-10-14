import { useAppSelector } from "@/hooks/hooks";
import { RootState } from "@/state/store";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const user = useAppSelector((state: RootState) => state.auth.user);

  console.log(user);
  return (
    <SafeAreaView>
      <Text>Home Page User Authenticated</Text>
    </SafeAreaView>
  );
}
