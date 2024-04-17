import 'react-native-url-polyfill/auto';
import '@aws-sdk/util-endpoints';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import {ReadableStream} from 'web-streams-polyfill/ponyfill';
import 'text-encoding-polyfill';
globalThis.ReadableStream = ReadableStream;

import crypto from 'isomorphic-webcrypto';

const prepareCrypto = async () => {
  console.log('globalThis.crypto', globalThis.crypto);
  await crypto.ensureSecure();
  globalThis.crypto = crypto;
};

import {MMKV} from 'react-native-mmkv';

import {Button, StyleSheet, Text, View} from 'react-native';
import {SequenceWaaS, defaults} from '@0xsequence/waas';
import {
  GoogleSignin,
  GoogleOneTapSignIn,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {ethers} from 'ethers';
import {useEffect} from 'react';

const projectAccessKey = 'AQAAAAAAAAA5Zk0aenPjVGFFziPaqgAWJX4';
const waasConfigKey =
  'eyJwcm9qZWN0SWQiOjU3LCJycGNTZXJ2ZXIiOiJodHRwczovL25leHQtd2Fhcy5zZXF1ZW5jZS5hcHAifQ==';

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
    network: 'polygon',
    projectAccessKey: projectAccessKey,
    waasConfigKey: waasConfigKey,
  },
  defaults.TEST,
  localStorage,
);

const signIn = async () => {
  // issue is here, so below this code is not tested because this part is not working
  const nonce = await sequence.getSessionHash();

  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleOneTapSignIn.signIn({
    webClientId:
      '277467576806-f8g9k1vu110ssa8lgt4fd2v1gjmc21as.apps.googleusercontent.com',
    iosClientId:
      'com.googleusercontent.apps.277467576806-f8g9k1vu110ssa8lgt4fd2v1gjmc21as',
    nonce: nonce,
  });
  console.log(userInfo);

  if (!userInfo.idToken) {
    console.log('No idToken');
    return;
  }

  try {
    const signInResult = await sequence.signIn(
      {idToken: userInfo.idToken},
      'asdasdasd',
    );
    console.log(signInResult);
  } catch (e) {
    console.log(e);
  }
};

export default function App() {
  useEffect(() => {
    prepareCrypto();
  }, []);
  return (
    <View style={styles.container}>
      <Text>Waas auth demo on React Native!</Text>
      <Button onPress={signIn} title="sign in" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const DEVICE_EMOJIS = [
  // 256 emojis for unsigned byte range 0 - 255
  ...'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦅🦉🦇🐺🐗🐴🦄🐝🐛🦋🐌🐞🐜🦟🦗🕷🕸🦂🐢🐍🦎🦖🦕🐙🦑🦐🦞🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🦧🐘🦛🦏🐪🐫🦒🦘🐃🐂🐄🐎🐖🐏🐑🦙🐐🦌🐕🐩🦮🐈🐓🦃🦚🦜🦢🦩🕊🐇🦝🦨🦡🦦🦥🐁🐀🐿🦔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿🍀🎍🎋🍃👣🍂🍁🍄🐚🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🍏🍎🍐🍊🍋🍌🍉🍇🍓🍈🥭🍍🥥🥝🍅🥑🥦🥬🥒🌶🌽🥕🧄🧅🥔🍠🥐🥯🍞🥖🥨🧀🥚🍳🧈🥞🧇🥓🥩🍗🍖🦴🌭🍔🍟🍕🥪🥙🧆🌮🌯🥗🥘🥫🍝🍜🍲🍛🍣🍱🥟🦪🍤🍙🍚🍘🍥🥠🥮🍢🍡🍧🍨🍦🥧🧁🍰🎂🍮🍭🍬🍫🍿🍩🍪🌰🥜👀👂👃👄👅👆👇👈👉👊👋👌👍👎👏👐👑👒👓🎯🎰🎱🎲🎳👾👯👺👻👽🏂🏃🏄',
];

// Generate a random name for the session, using a single random emoji and 2 random words
// from the list of words of ethers
export function randomName() {
  const wordlistSize = 2048;
  const words = ethers.wordlists.en;

  const randomEmoji =
    DEVICE_EMOJIS[Math.floor(Math.random() * DEVICE_EMOJIS.length)];
  const randomWord1 = words.getWord(Math.floor(Math.random() * wordlistSize));
  const randomWord2 = words.getWord(Math.floor(Math.random() * wordlistSize));

  return `${randomEmoji} ${randomWord1} ${randomWord2}`;
}
