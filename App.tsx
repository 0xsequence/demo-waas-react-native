import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import "react-native-get-random-values";
import {
  AuthRequest,
  exchangeCodeAsync,
  AccessTokenRequestConfig,
} from "expo-auth-session";
import { KeychainSecureStoreBackend } from "@0xsequence/react-native";
import { SequenceWaaS } from "@0xsequence/waas";
import { MMKV } from "react-native-mmkv";

const projectAccessKey = "AQAAAAAAAGLOEg2Q5NNVBLgUqoa_PVQvcmI";
const waasConfigKey =
  "eyJwcm9qZWN0SWQiOjI1Mjk0LCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0=";
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

const sequence = new SequenceWaaS(
  {
    network: "polygon",
    projectAccessKey: projectAccessKey,
    waasConfigKey: waasConfigKey,
  },
  localStorage,
  null,
  new KeychainSecureStoreBackend()
);

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    isSignedIn(setWalletAddress);
  }, []);

  return (
    <View style={styles.container}>
      {walletAddress && (
        <>
          <View>
            <Text>Wallet address: {walletAddress}</Text>

            <Button
              title="Sign out"
              onPress={() => {
                sequence.dropSession();
                setWalletAddress(null);
              }}
            />
          </View>
        </>
      )}
      {!walletAddress && (
        <Button
          title="Sign in to WaaS (Google)"
          onPress={async () => {
            const result = await signInWithGoogle();
            if (result.walletAddress) {
              setWalletAddress(result.walletAddress);
            }
            console.log("result", result);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

// Helpers

const isSignedIn = async (
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>
) => {
  const result = await sequence.isSignedIn();

  if (result) {
    sequence.getAddress().then((address) => {
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

  console.log("result", result);
  const serverAuthCode = result?.params?.code;

  console.log("serverAuthCode", serverAuthCode);
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

  console.log("idToken", idToken);

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
