import "./cryptoSetup";

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import {
  AuthRequest,
  exchangeCodeAsync,
  AccessTokenRequestConfig,
} from "expo-auth-session";
import { EmailConflictInfo, networks } from "@0xsequence/waas";
import * as WebBrowser from "expo-web-browser";
import appleAuth, {
  AppleButton,
  appleAuthAndroid,
} from "@invertase/react-native-apple-authentication";

import {
  sequenceWaas,
  initialNetwork,
  iosGoogleRedirectUri,
  iosGoogleClientId,
  webGoogleClientId,
} from "./waasSetup";

import CopyButton from "./components/CopyButton";
import EmailAuthView from "./components/EmailAuthView";

import { randomName } from "./utils/string";

import styles from "./styles";
import EmailConflictWarningView from "./components/EmailConflictWarningView";

const messageToSign = "Hello world";

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>(initialNetwork);

  const [isEmailAuthInProgress, setIsEmailAuthInProgress] = useState(false);

  const [isSignMessageInProgress, setIsSignMessageInProgress] = useState(false);
  const [sig, setSig] = useState<string | undefined>();

  const [isSendTxnInProgress, setIsSendTxnInProgress] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    isSignedIn(setWalletAddress);
  }, []);

  const [emailConflictInfo, setEmailConflictInfo] = useState<
    EmailConflictInfo | undefined
  >();
  const [isEmailConflictModalOpen, setIsEmailConflictModalOpen] =
    useState(false);
  const forceCreateFuncRef = useRef<(() => Promise<void>) | null>(null);

  sequenceWaas.onEmailConflict(async (info, forceCreate) => {
    forceCreateFuncRef.current = forceCreate;
    setEmailConflictInfo(info);
    setIsEmailConflictModalOpen(true);
  });

  const signMessage = async () => {
    setIsSignMessageInProgress(true);
    const sig = await sequenceWaas.signMessage({ message: messageToSign });
    setIsSignMessageInProgress(false);

    setSig(sig.data.signature);
  };

  const sendTxn = async () => {
    setIsSendTxnInProgress(true);
    const txn = await sequenceWaas.sendTransaction({
      transactions: [
        {
          to: walletAddress,
          value: 0,
        },
      ],
    });
    setIsSendTxnInProgress(false);
    if ("txHash" in txn.data) {
      setTxnHash(txn.data.txHash);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "dark-content"}
      />
      {isEmailAuthInProgress && (
        <EmailAuthView
          onCancel={() => setIsEmailAuthInProgress(false)}
          onSuccess={(walletAddress) => {
            setIsEmailAuthInProgress(false);
            setWalletAddress(walletAddress);
          }}
        />
      )}

      {isEmailConflictModalOpen && (
        <EmailConflictWarningView
          info={emailConflictInfo}
          onCancel={() => {
            setIsEmailAuthInProgress(false);
            setIsEmailConflictModalOpen(false);
            setEmailConflictInfo(undefined);
            forceCreateFuncRef.current = null;
          }}
          onConfirm={() => {
            setIsEmailConflictModalOpen(false);
            setEmailConflictInfo(undefined);
            forceCreateFuncRef.current?.();
          }}
        />
      )}

      {walletAddress && (
        <ScrollView style={{ paddingVertical: 60, width: "100%" }}>
          <View style={{ paddingBottom: 150 }}>
            <View style={styles.demoItemContainer}>
              <Text style={styles.demoItemTitle}>Wallet address</Text>
              <Text style={styles.demoItemText}>{walletAddress}</Text>
              <CopyButton stringToCopy={walletAddress} />
            </View>

            <View style={styles.demoItemContainer}>
              <Text style={styles.demoItemTitle}>Network</Text>
              <Text style={styles.demoItemText}>
                {networks.nameOfNetwork(network)}
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={signMessage}>
              <View style={styles.demoItemContainer}>
                <Text style={styles.demoItemTitle}>Sign a message</Text>
                <Text style={styles.demoItemTextSecondary}>
                  Sign a message with your wallet.
                </Text>
                <Text style={styles.demoItemTextSecondary}>
                  Message to sign: "{messageToSign}"
                </Text>
                {isSignMessageInProgress && (
                  <View style={{ paddingVertical: 5, width: 20 }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {sig && (
              <View style={styles.demoItemContainer}>
                <Text style={styles.demoItemTitleSecondary}>
                  Signature for "{messageToSign}":
                </Text>
                <ScrollView style={{ height: 140 }} nestedScrollEnabled={true}>
                  <Text style={styles.demoItemText}>{sig}</Text>
                </ScrollView>
                <CopyButton stringToCopy={sig} />
              </View>
            )}

            <TouchableOpacity activeOpacity={0.8} onPress={sendTxn}>
              <View style={styles.demoItemContainer}>
                <Text style={styles.demoItemTitle}>Send a transaction</Text>
                <Text style={styles.demoItemTextSecondary}>
                  Send a transaction with your wallet.
                </Text>

                {isSendTxnInProgress && (
                  <View style={{ paddingVertical: 5, width: 20 }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {txnHash && (
              <View style={styles.demoItemContainer}>
                <Text style={styles.demoItemTitleSecondary}>
                  Transaction hash:
                </Text>

                <Text style={styles.demoItemText}>{txnHash}</Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    WebBrowser.openBrowserAsync(
                      `https://sepolia.arbiscan.io/tx/${txnHash}`
                    );
                  }}
                >
                  <View
                    style={{
                      alignSelf: "baseline",
                      backgroundColor: "#000",
                      padding: 4,
                      borderRadius: 6,
                      marginTop: 6,
                    }}
                  >
                    <Text style={styles.demoItemTextSecondary}>
                      View on Arbiscan
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <Button
              title="Sign out"
              onPress={async () => {
                setSig(undefined);
                setTxnHash(undefined);
                setWalletAddress(null);
                await sequenceWaas.dropSession();
              }}
            />
          </View>
        </ScrollView>
      )}
      {!walletAddress && (
        <>
          <View
            style={{
              width: 150,
              height: 150,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              style={{
                width: 300,
                resizeMode: "contain",
              }}
              source={require("./assets/sequence-icon.png")}
            />
          </View>

          <View style={{ marginBottom: 50 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", color: "white" }}>
              Sequence WaaS Demo
            </Text>
          </View>

          {isLoggingIn ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 20,
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Button
                title="Sign in as guest"
                onPress={async () => {
                  setIsLoggingIn(true);
                  try {
                    const signInResult = await sequenceWaas.signIn(
                      { guest: true },
                      randomName()
                    );

                    if (signInResult.wallet) {
                      setWalletAddress(signInResult.wallet);
                    } else {
                      console.error("No wallet address after guest sign in");
                    }
                  } catch (error) {
                    console.error("Guest sign in failed:", error);
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
              />
              <View style={{ marginTop: 10 }} />
              <Button
                title="Sign in with Email"
                onPress={() => {
                  setIsEmailAuthInProgress(true);
                }}
              />
              <View style={{ marginTop: 10 }} />
              <Button
                title="Sign in with Google"
                onPress={async () => {
                  setIsLoggingIn(true);
                  try {
                    const result = await signInWithGoogle();
                    if (result?.walletAddress) {
                      setWalletAddress(result.walletAddress);
                    }
                  } catch (error) {
                    console.error("Google sign in failed:", error);
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
              />
              <View style={{ marginTop: 10 }} />
              <AppleButton
                buttonStyle={AppleButton.Style.WHITE}
                buttonType={AppleButton.Type.SIGN_IN}
                style={{
                  width: 160,
                  height: 45,
                }}
                onPress={async () => {
                  setIsLoggingIn(true);
                  try {
                    if (Platform.OS === "ios") {
                      const result = await signInWithAppleIOS();
                      if (result?.walletAddress) {
                        setWalletAddress(result.walletAddress);
                      }
                    }
                    if (Platform.OS === "android") {
                      const result = await signInWithAppleAndroid();
                      if (result?.walletAddress) {
                        setWalletAddress(result.walletAddress);
                      }
                    }
                  } catch (error) {
                    console.error("Apple sign in failed:", error);
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

// Helpers

const isSignedIn = async (
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>
) => {
  const isSignedIn = await sequenceWaas.isSignedIn();

  if (isSignedIn) {
    sequenceWaas.getAddress().then((address) => {
      setWalletAddress(address);
    });
  }
};

type GoogleUser = {
  user: {
    id: string;
    name: string | null;
    givenName: string | null;
    familyName: string | null;
    photo: string | null;
  };
  idToken: string;
};

const signInWithGoogle = async () => {
  const redirectUri = `${iosGoogleRedirectUri}:/oauthredirect`;

  const scopes = ["openid", "profile", "email"];
  const request = new AuthRequest({
    clientId: iosGoogleClientId,
    scopes,
    redirectUri,
    usePKCE: true,
    extraParams: {
      audience: webGoogleClientId,
      include_granted_scopes: "true",
    },
  });

  const result = await request.promptAsync({
    authorizationEndpoint: `https://accounts.google.com/o/oauth2/v2/auth`,
  });

  if (result.type === "cancel") {
    return undefined;
  }

  if (result.type !== "success") {
    throw new Error("Authentication failed");
  }

  const serverAuthCode = result.params?.code;

  const configForTokenExchange: AccessTokenRequestConfig = {
    code: serverAuthCode,
    redirectUri,
    clientId: iosGoogleClientId,
    extraParams: {
      code_verifier: request?.codeVerifier || "",
      audience: webGoogleClientId,
    },
  };

  const tokenResponse = await exchangeCodeAsync(configForTokenExchange, {
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  });

  const userInfo = await fetchGoogleUserInfo(tokenResponse.accessToken);

  const idToken = tokenResponse.idToken;

  if (!idToken) {
    throw new Error("No idToken");
  }

  const waasSession = await authenticateWithWaas(idToken);

  if (!waasSession) {
    throw new Error("No WaaS session");
  }

  return {
    userInfo: {
      user: userInfo,
      idToken,
    },
    walletAddress: waasSession.wallet,
  };
};

const signInWithAppleIOS = async () => {
  // performs login request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    // Note: it appears putting FULL_NAME first is important, see issue #293
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  // get current authentication state for user
  // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
  const credentialState = await appleAuth.getCredentialStateForUser(
    appleAuthRequestResponse.user
  );

  // use credentialState response to ensure the user is authenticated
  if (credentialState === appleAuth.State.AUTHORIZED) {
    // user is authenticated

    const idToken = appleAuthRequestResponse.identityToken;

    if (!idToken) {
      throw new Error("No idToken");
    }

    const waasSession = await authenticateWithWaas(idToken);

    if (!waasSession) {
      throw new Error("No WaaS session");
    }

    return {
      userInfo: {
        user: appleAuthRequestResponse.user,
        idToken,
      },
      walletAddress: waasSession.wallet,
    };
  }
};

const signInWithAppleAndroid = async () => {
  // Configure the request
  appleAuthAndroid.configure({
    // The Service ID you registered with Apple
    clientId: "com.horizon.waas-demo",

    // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
    // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
    redirectUri: "https://waas-demo.sequence.app/callback",

    // The type of response requested - code, id_token, or both.
    responseType: appleAuthAndroid.ResponseType.ALL,

    // The amount of user information requested from Apple.
    scope: appleAuthAndroid.Scope.ALL,
  });

  // Open the browser window for user sign in
  const response = await appleAuthAndroid.signIn();

  const idToken = response.id_token;

  if (!idToken) {
    throw new Error("No idToken");
  }

  const waasSession = await authenticateWithWaas(idToken);

  if (!waasSession) {
    throw new Error("No WaaS session");
  }

  return {
    userInfo: {
      idToken,
    },
    walletAddress: waasSession.wallet,
  };
};

const authenticateWithWaas = async (
  idToken: string
): Promise<{ sessionId: string; wallet: string } | null> => {
  try {
    const signInResult = await sequenceWaas.signIn(
      {
        idToken,
      },
      randomName()
    );

    return signInResult;
  } catch (e) {
    console.log("error in authenticateWithWaas", JSON.stringify(e));
  }

  return null;
};

const fetchGoogleUserInfo = async (
  accessToken: string
): Promise<GoogleUser["user"]> => {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json: any = await response.json();

  return {
    id: json.sub,
    name: json.name,
    givenName: json.given_name,
    familyName: json.family_name,
    photo: json.picture,
  };
};
