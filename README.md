# Sequence WaaS React Native Demo

A demo app for helping developers integrate Sequence WaaS (Embedded wallet) into their React Native apps.

## How to run

1. Clone the repo
2. Run `yarn install` to install dependencies
3. Run `yarn ios` or `yarn android` to run the app on device/simulator

## Details for integrating Sequence WaaS (Embedded wallet) on your React Native app

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

## ./ios and ./android folder specific instructions

### iOS

Set CFBundleURLSchemes and GIDClientID in the Info.plist file for Google sign in.

### Android

Set the intent-filter in the AndroidManifest.xml file for Google sign in.
