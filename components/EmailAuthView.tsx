import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";

import styles from "../styles";
import { useEmailAuth } from "../hooks/useEmailAuth";
import { randomName } from "../utils/string";
import { sequenceWaas } from "../waasSetup";

export default function EmailAuthView({
  onSuccess,
}: {
  onSuccess: (walletAddress: string) => void;
}) {
  const [email, setEmail] = useState<string | undefined>();
  const [answer, setAnswer] = useState<string | undefined>();
  const [didSendChallengeAnswer, setDidSendChallengeAnswer] = useState(false);

  useEffect(() => {
    return () => {
      setEmail(undefined);
      setAnswer(undefined);
      setDidSendChallengeAnswer(false);
    };
  }, []);

  const {
    inProgress: emailAuthInProgress,
    loading: emailAuthLoading,
    initiateAuth: initiateEmailAuth,
    sendChallengeAnswer,
  } = useEmailAuth({
    onSuccess: async (idToken) => {
      const walletAddress = await sequenceWaas.signIn(
        { idToken },
        randomName()
      );
      console.log(`Wallet address: ${walletAddress}`);
      onSuccess(walletAddress.wallet);
    },
  });

  return (
    <View style={styles.emailAuthContainer}>
      <View style={styles.demoItemContainer}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          {!emailAuthInProgress && !didSendChallengeAnswer && (
            <>
              <Text style={styles.demoItemTitle}>Sign in with email</Text>

              <TextInput
                autoComplete="off"
                autoFocus={true}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={{
                  width: 240,
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 6,
                  borderWidth: 1,
                  padding: 10,
                  marginTop: 20,
                  marginBottom: 20,
                }}
              />
              <Button
                title="Continue"
                onPress={() => {
                  if (isValidEmail(email)) {
                    initiateEmailAuth(email);
                  }
                }}
              />
            </>
          )}

          {emailAuthInProgress && !didSendChallengeAnswer && (
            <>
              <Text style={styles.demoItemTitle}>Enter code from email</Text>
              <TextInput
                autoComplete="off"
                autoFocus={true}
                autoCapitalize="none"
                value={answer}
                onChangeText={setAnswer}
                style={{
                  width: 240,
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 6,
                  borderWidth: 1,
                  padding: 10,
                  marginTop: 20,
                  marginBottom: 20,
                }}
              />
              <Button
                title="Continue"
                onPress={() => {
                  if (answer && answer.length === 6) {
                    setDidSendChallengeAnswer(true);
                    sendChallengeAnswer(answer);
                  }
                }}
              />
            </>
          )}

          {didSendChallengeAnswer && (
            <View style={{ padding: 16 }}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function isValidEmail(email: string) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}
