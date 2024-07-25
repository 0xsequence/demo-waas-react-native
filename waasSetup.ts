import { SequenceWaaS } from "@0xsequence/waas";
import { KeychainSecureStoreBackend } from "@0xsequence/react-native";
import { MMKV } from "react-native-mmkv";

const projectAccessKey = "AQAAAAAAAI9WEA9-IwH6yjyN0Ts0jEK-8Qk";
const waasConfigKey =
  "eyJwcm9qZWN0SWQiOjM2Njk0LCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0=";

export const webGoogleClientId =
  "970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com";
export const iosGoogleClientId =
  "970987756660-eu0kjc9mda0iuiuktoq0lbme9mmn1j8m.apps.googleusercontent.com";

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

export const initialNetwork = "arbitrum-sepolia";

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
