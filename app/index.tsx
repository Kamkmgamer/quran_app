import { HelloWave } from "@/components/HelloWave";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="px-5">
      <Text className="text-xl text-right flex">
        مرحباً بكم في تطبيق هدى القران
        <HelloWave />
      </Text>
    </SafeAreaView>
  );
}
