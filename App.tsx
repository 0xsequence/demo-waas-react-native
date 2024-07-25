import { install } from "react-native-quick-crypto";
install();

import "@ethersproject/shims";

import "react-native-url-polyfill/auto";
import { ReadableStream } from "web-streams-polyfill";
globalThis.ReadableStream = ReadableStream;

import { useEffect, useState } from "react";
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

import { networks } from "@0xsequence/waas";
import * as WebBrowser from "expo-web-browser";
import appleAuth, {
  AppleButton,
  appleAuthAndroid,
} from "@invertase/react-native-apple-authentication";

import {
  sequenceWaas,
  initialNetwork,
  iosGoogleClientId,
  webGoogleClientId,
} from "./waasSetup";

import CopyButton from "./components/CopyButton";
import EmailAuthView from "./components/EmailAuthView";

import { randomName } from "./utils/string";

import styles from "./styles";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
  User,
} from "@react-native-google-signin/google-signin";

const messageToSign = "Hello world";

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>(initialNetwork);

  const [isEmailAuthInProgress, setIsEmailAuthInProgress] = useState(false);

  const [isSignMessageInProgress, setIsSignMessageInProgress] = useState(false);
  const [sig, setSig] = useState<string | undefined>();

  const [isSendTxnInProgress, setIsSendTxnInProgress] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();

  useEffect(() => {
    isSignedIn(setWalletAddress);
  }, []);

  sequenceWaas.onEmailConflict(async (info, forceCreate) => {
    console.log("onEmailConflict", info);

    // This can be handled by the app by showing a dialog to the user, for demo purposes we will just force create a new session
    forceCreate();
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
    if (txn.data?.txHash) {
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
          <View style={{ alignItems: "center", justifyContent: "center" }}>
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
                const result = await signInWithGoogle();
                if (result.walletAddress) {
                  setWalletAddress(result.walletAddress);
                }
              }}
            />
            <View style={{ marginTop: 10 }} />
            <AppleButton
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.SIGN_IN}
              style={{
                width: 160, // You must specify a width
                height: 45, // You must specify a height
              }}
              onPress={async () => {
                if (Platform.OS === "ios") {
                  const result = await signInWithAppleIOS();
                  if (result.walletAddress) {
                    setWalletAddress(result.walletAddress);
                  }
                }
                if (Platform.OS === "android") {
                  const result = await signInWithAppleAndroid();

                  if (result.walletAddress) {
                    setWalletAddress(result.walletAddress);
                  }
                }
              }}
            />
          </View>
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
  GoogleSignin.configure({
    webClientId: webGoogleClientId,
    iosClientId: iosGoogleClientId,
    forceCodeForRefreshToken: true,
  });

  let user: User | undefined;

  try {
    await GoogleSignin.hasPlayServices();
    user = await GoogleSignin.signIn();
    console.log("Google Sign-in user", JSON.stringify(user, null, 2));
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // user cancelled the login flow
          console.log("Google Sign-in", "User cancelled sign in");
          break;
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          console.log("Google Sign-in", "Operation already in progress");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // play services not available or outdated
          console.log("Google Sign-in", "Play services not available");
          break;
        default:
          console.log("Google Sign-in", "Unknown error", JSON.stringify(error));
        // some other error happened
      }
    } else {
      console.log("Google Sign-in", "Unknown error", error);
      // an error that's not related to google sign in occurred
    }
    throw error;
  }

  if (user) {
    const waasSession = await authenticateWithWaas(user.idToken);

    if (!waasSession) {
      throw new Error("No waas session");
    }

    return {
      userInfo: user.user,
      walletAddress: waasSession.wallet,
    };
  }
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
      throw new Error("No waas session");
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
    throw new Error("No waas session");
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

const fetchUserInfo = async (
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
