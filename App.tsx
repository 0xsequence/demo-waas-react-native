import "react-native-random-values-jsi-helper";

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
} from "react-native";
import {
  AuthRequest,
  exchangeCodeAsync,
  AccessTokenRequestConfig,
} from "expo-auth-session";
import { KeychainSecureStoreBackend } from "@0xsequence/react-native";
import { SequenceWaaS, networks } from "@0xsequence/waas";
import { MMKV } from "react-native-mmkv";
import * as WebBrowser from "expo-web-browser";

import styles from "./styles";

import CopyButton from "./components/CopyButton";
import appleAuth, {
  AppleButton,
  appleAuthAndroid,
} from "@invertase/react-native-apple-authentication";

const projectAccessKey = "AQAAAAAAAGLOEg2Q5NNVBLgUqoa_PVQvcmI";
const waasConfigKey =
  "eyJwcm9qZWN0SWQiOjI1Mjk0LCJlbWFpbFJlZ2lvbiI6ImNhLWNlbnRyYWwtMSIsImVtYWlsQ2xpZW50SWQiOiI2dXR0aWJhZmwyZTQxbWU5OTc1NXE3cnJraCIsInJwY1NlcnZlciI6Imh0dHBzOi8vd2Fhcy5zZXF1ZW5jZS5hcHAifQ==";
const webClientId =
  "970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com";
const iosClientId =
  "970987756660-eu0kjc9mda0iuiuktoq0lbme9mmn1j8m.apps.googleusercontent.com";
const iosRedirectUri =
  "com.googleusercontent.apps.970987756660-eu0kjc9mda0iuiuktoq0lbme9mmn1j8m";

const storage = new MMKV();

const localStorage = {
  get: async (key: string) => {
    return storage.getString(key) ?? null;
  },
  set: async (key: string, value: string) => {
    if (value === null) {
      storage.delete(key);
      return;
    }
    storage.set(key, value);
  },
};

const initialNetwork = "arbitrum-sepolia";

const sequence = new SequenceWaaS(
  {
    network: initialNetwork,
    projectAccessKey: projectAccessKey,
    waasConfigKey: waasConfigKey,
  },
  localStorage,
  null,
  new KeychainSecureStoreBackend()
);

const messageToSign = "Hello world";

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>(initialNetwork);

  const [isSignMessageInProgress, setIsSignMessageInProgress] = useState(false);
  const [sig, setSig] = useState<string | undefined>();

  const [isSendTxnInProgress, setIsSendTxnInProgress] = useState(false);
  const [txnHash, setTxnHash] = useState<string | undefined>();

  useEffect(() => {
    isSignedIn(setWalletAddress);
  }, []);

  const signMessage = async () => {
    setIsSignMessageInProgress(true);
    const sig = await sequence.signMessage({ message: messageToSign });
    setIsSignMessageInProgress(false);

    setSig(sig.data.signature);
  };

  const sendTxn = async () => {
    setIsSendTxnInProgress(true);
    const txn = await sequence.sendTransaction({
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
                await sequence.dropSession();
                sequence.getSessionHash();
              }}
            />
          </View>
        </ScrollView>
      )}
      {!walletAddress && (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Button
            title="Sign in with Google"
            onPress={async () => {
              const result = await signInWithGoogle();
              if (result.walletAddress) {
                setWalletAddress(result.walletAddress);
              }
              console.log("result", result);
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
      )}
    </View>
  );
}

// Helpers

const isSignedIn = async (
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>
) => {
  const isSignedIn = await sequence.isSignedIn();

  if (isSignedIn) {
    sequence.getAddress().then((address) => {
      setWalletAddress(address);
    });
  } else {
    sequence.getSessionHash();
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
  const nonce = await sequence.getSessionHash();

  const redirectUri = `${iosRedirectUri}:/oauthredirect`;

  console.log("nonce", nonce);
  console.log("iosClientId", iosClientId);
  console.log("webClientId", webClientId);
  console.log("redirectUri", redirectUri);

  const scopes = ["openid", "profile", "email"];
  const request = new AuthRequest({
    clientId: iosClientId,
    scopes,
    redirectUri,
    usePKCE: true,
    extraParams: {
      nonce: nonce,
      audience: webClientId,
      include_granted_scopes: "true",
    },
  });

  const result = await request.promptAsync({
    authorizationEndpoint: `https://accounts.google.com/o/oauth2/v2/auth`,
  });

  if (result.type === "cancel") {
    return undefined;
  }

  const serverAuthCode = result?.params?.code;

  const configForTokenExchange: AccessTokenRequestConfig = {
    code: serverAuthCode,
    redirectUri,
    clientId: iosClientId,
    extraParams: {
      code_verifier: request?.codeVerifier || "",
      audience: webClientId,
    },
  };

  const tokenResponse = await exchangeCodeAsync(configForTokenExchange, {
    tokenEndpoint: "https://oauth2.googleapis.com/token",
  });

  const userInfo = await fetchUserInfo(tokenResponse.accessToken);

  const idToken = tokenResponse.idToken;

  if (!idToken) {
    throw new Error("No idToken");
  }

  const waasSession = await authenticateWithWaas(idToken);

  if (!waasSession) {
    throw new Error("No waass session");
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
  const nonce = await sequence.getSessionHash();

  // performs login request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    nonce,
    hashNonceAutomatically: false,
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
      throw new Error("No waass session");
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
  const nonce = await sequence.getSessionHash();

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

    nonce,

    hashNonceAutomatically: false,
  });

  // Open the browser window for user sign in
  const response = await appleAuthAndroid.signIn();

  const idToken = response.id_token;

  console.log("idToken", idToken);

  if (!idToken) {
    throw new Error("No idToken");
  }

  const waasSession = await authenticateWithWaas(idToken);

  if (!waasSession) {
    throw new Error("No waass session");
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
    const signInResult = await sequence.signIn(
      {
        idToken: idToken,
      },
      "iOS"
    );

    return signInResult;
  } catch (e) {
    console.log("error", JSON.stringify(e));
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
