# Sequence Embedded Wallet React Native Demo

A demo app to help developers integrate Sequence Embedded Wallet into their React Native apps. It comes with credentials/keys set up for Google, Apple and Email sign in. Follow the instructions below to set up your own credentials/keys and integrate to your own app.

### Preview

https://github.com/0xsequence/demo-waas-react-native/assets/11508521/157cab83-1f26-4d8a-b62d-fc9c28d2c50d

---

## How to run the demo

1. Clone the repo
2. Run `yarn install` to install dependencies
3. Run `yarn ios` or `yarn android` to run the app on device/simulator

Note: In case `yarn android` does not work for you at the first try, you may need to first run the project with Android Studio for gradle setup/sync.

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

- ethers
- ethersproject/shims
- expo
- react-native-quick-crypto
- react-native-mmkv
- expo-secure-store

- babel-plugin-module-resolver (as dev dependency)

#### For Apple and Google login

- expo-web-browser
- expo-auth-session
- @invertase/react-native-apple-authentication

#### For Email login

- react-native-url-polyfill
- web-streams-polyfill

---

## Integration details

### 1. Setup shims for ethers and other crypto related packages

First, let's check contents of [cryptoSetup.ts](./cryptoSetup.ts) for the set up of the shims and registering `pbkdf2` for `ethers` from `react-native-quick-crypto` below:

```ts
import { install } from "react-native-quick-crypto";
install();

import "react-native-url-polyfill/auto";
import { ReadableStream } from "web-streams-polyfill";
globalThis.ReadableStream = ReadableStream;

import crypto from "react-native-quick-crypto";
global.getRandomValues = crypto.getRandomValues;

export * from "@ethersproject/shims";

import * as ethers from "ethers";

ethers.pbkdf2.register(
  (
    password: Uint8Array,
    salt: Uint8Array,
    iterations: number,
    keylen: number,
    algo: "sha256" | "sha512"
  ) => {
    console.info("Using react-native-quick-crypto for pbkdf2");
    return ethers.hexlify(
      new Uint8Array(
        crypto.pbkdf2Sync(
          password,
          salt,
          iterations,
          keylen,
          algo === "sha256" ? "SHA-256" : "SHA-512"
        )
      )
    );
  }
);

export * from "ethers";
```

**Important Note on `ethers` Usage:**

To ensure consistent `ethers` version and shimming across your project, always import `ethers` utilities from the local [`./cryptoSetup.ts`](./cryptoSetup.ts:1) file. You can do this in two main ways:

1.  Import all exports under the `ethers` namespace:

    ```ts
    import * as ethers from "./cryptoSetup";
    // Now you can use ethers.Wallet, ethers.utils, etc.
    ```

2.  Import specific named members:
    ```ts
    import { Wallet, Contract, utils } from "./cryptoSetup";
    ```

Do **not** import directly from the `ethers` package (e.g., `import { ethers } from 'ethers';` or `import * as ethers from 'ethers'`).

To enforce this pattern, you can add the following ESLint rule to your configuration (e.g., in [`eslint.config.js`](eslint.config.js:1)):

```javascript
// eslint.config.js or similar
{
  // ... other configurations
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "ethers", // This targets the original 'ethers' package
            message: "Please import 'ethers' members from './cryptoSetup.ts' instead to use the project-specific version and shims."
          }
        ]
      }
    ]
  }
}
```

This demo project already includes a similar rule to guide imports. The key is to ensure that any attempt to import directly from the `"ethers"` package is flagged.

Then make sure to import `cryptoSetup.ts` as early in the app lifecycle as you can. In this demo these are imported and set at the top in [App.tsx](./App.tsx).

```ts
import "./cryptoSetup";
```

Secondly, we need to set aliases for some shims, in `babel.config.js` with help of the `babel-plugin-module-resolver` dev dependency. See [babel.config.js](./babel.config.js) for the code snippet to update the aliases.

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
  new ExpoSecureStoreBackend()
);
```

(Check [waasSetup.ts](./waasSetup.ts) file for more details)

### 3. Signing in

Once you have an initialized Sequence Embedded Wallet (WaaS) instance, you can use it to sign in with email, Google or Apple. See the google code snippet below for an example, and check the [App.tsx](./App.tsx) file for more details.

```ts
const redirectUri = `${iosGoogleRedirectUri}:/oauthredirect`;

const scopes = ["openid", "profile", "email"];
const request = new AuthRequest({
  clientId,
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
