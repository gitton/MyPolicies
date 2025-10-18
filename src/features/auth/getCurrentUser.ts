import { User } from "@/types/User";
import { getAuth } from "@react-native-firebase/auth";

export const getCurrentUser = (): User | null => {
  const user = getAuth().currentUser;
  if (!user) {
    return null;
  }
  return { id: user.uid };
};
