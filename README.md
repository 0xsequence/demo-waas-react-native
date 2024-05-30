# Sequence WaaS React Native Demo

A demo app to help developers integrate Sequence WaaS (Embedded wallet) into their React Native apps.

---

## How to run the demo

1. Clone the repo
2. Run `yarn install` to install dependencies
3. Run `yarn ios` or `yarn android` to run the app on device/simulator

---

## Setting up credentials/keys

Follow this guide to get your project access key and other credentials/keys: https://docs.sequence.xyz/solutions/builder/embedded-wallet/

## Dependencies

### Required Sequence packages

- @0xsequence/waas
- @0xsequence/react-native

### Other Required dependencies/shims

### Common

- ethers (5.7.2)
- ethersproject/shims
- expo
- react-native-quick-crypto
- react-native-mmkv
- react-native-keychain

- babel-plugin-module-resolver (as dev dependency)

### For Apple and Google login

- expo-web-browser
- expo-auth-session
- @invertase/react-native-apple-authentication (use the forked version specified in the package.json)

### For Email login

- react-native-url-polyfill
- web-streams-polyfill

---

## Integration details

### 1. Setup shims for ethers and other crypto related packages

Firstly, make sure to do this step as early in your apps lifecycle as possible. In this demo these are imported and set at the top in `App.tsx`.

```ts
import { install } from "react-native-quick-crypto";
install();

import "@ethersproject/shims";

import "react-native-url-polyfill/auto";
import { ReadableStream } from "web-streams-polyfill";
globalThis.ReadableStream = ReadableStream;
```

Secondly, we need to set aliases for the shims, in `babel.config.js` with help of the dev dependency `babel-plugin-module-resolver`, and also we need to make sure to use `pbkdf2` from `react-native-quick-crypto`. This helps us speed up the random value generation. See `babel.config.js` for the code snippet to update the aliases.

(See https://github.com/ethers-io/ethers.js/issues/2250#issuecomment-1321134111 for more details on react-native-quick-crypto alias setup)

### 2. Initialize Sequence WaaS

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

(Check `waasSetup.ts` file to see for more details)

### 3. Signing in

Once you have an initialized Sequence WaaS instance, you can use it to sign in with email, Google or Apple. Check the `App.tsx` file for more details.

### 4. Wallet operations

Once signed in, you can use the `sequenceWaas` instance to perform wallet operations like sending transactions, signing messages, etc. Check the `App.tsx` file for more details.

---

## ./ios and ./android folder specific instructions

### iOS

Set CFBundleURLSchemes and GIDClientID in the Info.plist file for Google sign in.

### Android

Set the intent-filter in the AndroidManifest.xml file for Google sign in.
