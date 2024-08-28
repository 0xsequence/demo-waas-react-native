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
