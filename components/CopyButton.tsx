import { TouchableOpacity, View, Text } from "react-native";
import * as Clipboard from "expo-clipboard";

import styles from "../styles";

export default function CopyButton({ stringToCopy }: { stringToCopy: string }) {
  return (
    <TouchableOpacity
      onPress={() => Clipboard.setStringAsync(stringToCopy)}
      activeOpacity={0.6}
      style={{ marginTop: 6 }}
    >
      <View
        style={{
          width: 45,
          backgroundColor: "#000",
          borderRadius: 6,
          padding: 4,
        }}
      >
        <Text style={styles.demoItemTextSecondary}>Copy</Text>
      </View>
    </TouchableOpacity>
  );
}
