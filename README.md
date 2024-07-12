# Sequence Embedded Wallet React Native Demo

A demo app to help developers integrate Sequence Embedded Wallet into their React Native apps. It comes with credentials/keys set up for Google, Apple and Email sign in. Follow the instructions below to set up your own credentials/keys and integrate to your own app.

### Preview

https://github.com/0xsequence/demo-waas-react-native/assets/11508521/157cab83-1f26-4d8a-b62d-fc9c28d2c50d

---

## How to run the demo

1. Clone the repo
2. Run `yarn install` to install dependencies
3. Run `yarn ios` or `yarn android` to run the app on device/simulator

---

## Setting up with your own credentials/keys

Follow this guide to get your project access key and other credentials/keys: https://docs.sequence.xyz/solutions/builder/embedded-wallet/

### Setting up with your own credentials/keys using app.json or app.config.js

#### iOS

Set GIDClientID in ios > infoPlist in the app.json file.

#### Android

Set the intent-filter in android > intentFilters in the app.json file.

## Dependencies

### Required Sequence packages

- @0xsequence/waas
- @0xsequence/react-native

### Other Required dependencies/shims

#### Common

- ethers (5.7.2)
- ethersproject/shims
- expo
- react-native-quick-crypto
- react-native-mmkv
- react-native-keychain

- babel-plugin-module-resolver (as dev dependency)

#### For Apple and Google login

- expo-web-browser
- expo-auth-session
- @invertase/react-native-apple-authentication (use the forked version specified in the package.json)

#### For Email login

- react-native-url-polyfill
- web-streams-polyfill

---

## Integration details

### 1. Setup shims for ethers and other crypto related packages

Firstly, make sure to do this step as early in your apps lifecycle as possible. In this demo these are imported and set at the top in [App.tsx](./App.tsx).

```ts
import { install } from "react-native-quick-crypto";
install();

import "@ethersproject/shims";

import "react-native-url-polyfill/auto";
import { ReadableStream } from "web-streams-polyfill";
globalThis.ReadableStream = ReadableStream;
```

Secondly, we need to set aliases for the shims, in `babel.config.js` with help of the dev dependency `babel-plugin-module-resolver`, and also we need to make sure to use `pbkdf2` from `react-native-quick-crypto`. This helps us speed up the random value generation. See [babel.config.js](./babel.config.js) for the code snippet to update the aliases.

(See https://github.com/ethers-io/ethers.js/issues/2250#issuecomment-1321134111 for more details on react-native-quick-crypto alias setup)

### 2. Initialize Sequence Embedded Wallet (WaaS)

```ts
export const sequenceWaas = new SequenceWaaS(
  {
    network: initialNetwork,
    projectAccessKey: projectAccessKey,
    waasConfigKey: waasConfigKey,
  },
  localStorage,
  null,
  new KeychainSecureStoreBackend()
);
```

(Check [waasSetup.ts](./waasSetup.ts) file for more details)

### 3. Signing in

Once you have an initialized Sequence Embedded Wallet (WaaS) instance, you can use it to sign in with email, Google or Apple. See the google code snippet below for an example, and check the [App.tsx](./App.tsx) file for more details.

```ts
const nonce = await sequenceWaas.getSessionHash();

const redirectUri = `${iosGoogleRedirectUri}:/oauthredirect`;

const scopes = ["openid", "profile", "email"];
const request = new AuthRequest({
  clientId,
  scopes,
  redirectUri,
  usePKCE: true,
  extraParams: {
    nonce: nonce,
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

const serverAuthCode = result?.params?.code;

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

const userInfo = await fetchUserInfo(tokenResponse.accessToken);

const idToken = tokenResponse.idToken;

if (!idToken) {
  throw new Error("No idToken");
}

try {
  const signInResult = await sequenceWaas.signIn(
    {
      idToken: idToken,
    },
    randomName()
  );

  console.log("signInResult", JSON.stringify(signInResult));
} catch (e) {
  console.log("error", JSON.stringify(e));
}
```

### 4. Wallet operations

Once signed in, you can use the `sequenceWaas` instance to perform wallet operations like sending transactions, signing messages, etc. See the google code snippet below for an example, and check the [App.tsx](./App.tsx) file for more details.

```ts
// Signing a message
const signature = await sequenceWaas.signMessage({ message: "your message" });

// Sending a txn
const txn = await sequenceWaas.sendTransaction({
  transactions: [
    {
      to: walletAddress,
      value: 0,
    },
  ],
});
```
