import { View, Text, Button } from "react-native";

import styles from "../styles";
import { EmailConflictInfo, IdentityType } from "@0xsequence/waas";

export default function EmailConflictWarningView({
  info,
  onCancel,
  onConfirm,
}: {
  info?: EmailConflictInfo;
  onCancel?: () => void;
  onConfirm?: () => void;
}) {
  const accountTypeText = (info: EmailConflictInfo) => {
    if (info.type === IdentityType.PlayFab) {
      return "PlayFab login";
    }

    if (info.type === IdentityType.Email) {
      return "Email login";
    }

    if (info.type === IdentityType.OIDC) {
      switch (info.issuer) {
        case "https://accounts.google.com":
          return "Google login";
        case "https://appleid.apple.com":
          return "Apple login";
        default:
          return "Unknown account type";
      }
    }

    return "Unknown account type";
  };

  const accType = accountTypeText(info);

  return (
    <View style={styles.emailConflictContainer}>
      <View style={styles.demoItemContainer}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 8,
            alignItems: "center",
          }}
        >
          <Text style={styles.demoItemTitle}>
            This email ({info?.email}) already in use with another sign in
            method ({accType}).
          </Text>
        </View>

        <View>
          <Button title="Cancel sign in" onPress={onCancel} />
          <Button title="Create new account" onPress={onConfirm} />
        </View>
      </View>
    </View>
  );
}
