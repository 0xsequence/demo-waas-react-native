import { SequenceWaaS } from "@0xsequence/waas";
import { KeychainSecureStoreBackend } from "@0xsequence/react-native";
import { MMKV } from "react-native-mmkv";

const projectAccessKey = "AQAAAAAAAGLOEg2Q5NNVBLgUqoa_PVQvcmI";
const waasConfigKey =
  "eyJwcm9qZWN0SWQiOjI1Mjk0LCJlbWFpbFJlZ2lvbiI6ImNhLWNlbnRyYWwtMSIsImVtYWlsQ2xpZW50SWQiOiI2dXR0aWJhZmwyZTQxbWU5OTc1NXE3cnJraCIsInJwY1NlcnZlciI6Imh0dHBzOi8vd2Fhcy5zZXF1ZW5jZS5hcHAifQ==";
export const webClientId =
  "970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com";
export const iosClientId =
  "970987756660-eu0kjc9mda0iuiuktoq0lbme9mmn1j8m.apps.googleusercontent.com";
export const iosRedirectUri =
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
