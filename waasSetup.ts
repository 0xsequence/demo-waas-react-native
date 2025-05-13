import { SequenceWaaS, SecureStoreBackend } from "@0xsequence/waas";
import * as SecureStore from "expo-secure-store";
import { MMKV } from "react-native-mmkv";

class ExpoSecureStoreBackend implements SecureStoreBackend {
  private getKey(dbName: string, dbStoreName: string, key: string): string {
    return `${dbName}-${dbStoreName}-${key}`;
  }

  async get(
    dbName: string,
    dbStoreName: string,
    key: string
  ): Promise<any | null> {
    const fullKey = this.getKey(dbName, dbStoreName, key);
    try {
      const value = await SecureStore.getItemAsync(fullKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get item from SecureStore: ${fullKey}`, error);
      return null;
    }
  }

  async set(
    dbName: string,
    dbStoreName: string,
    key: string,
    value: any
  ): Promise<boolean> {
    const fullKey = this.getKey(dbName, dbStoreName, key);
    try {
      await SecureStore.setItemAsync(fullKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item in SecureStore: ${fullKey}`, error);
      return false;
    }
  }

  async delete(
    dbName: string,
    dbStoreName: string,
    key: string
  ): Promise<boolean> {
    const fullKey = this.getKey(dbName, dbStoreName, key);
    try {
      await SecureStore.deleteItemAsync(fullKey);
      return true;
    } catch (error) {
      console.error(
        `Failed to delete item from SecureStore: ${fullKey}`,
        error
      );
      return false;
    }
  }
}

const projectAccessKey = "AQAAAAAAAI9WEA9-IwH6yjyN0Ts0jEK-8Qk";
const waasConfigKey =
  "eyJwcm9qZWN0SWQiOjM2Njk0LCJycGNTZXJ2ZXIiOiJodHRwczovL3dhYXMuc2VxdWVuY2UuYXBwIn0=";

export const webGoogleClientId =
  "970987756660-35a6tc48hvi8cev9cnknp0iugv9poa23.apps.googleusercontent.com";
export const iosGoogleClientId =
  "970987756660-eu0kjc9mda0iuiuktoq0lbme9mmn1j8m.apps.googleusercontent.com";
export const iosGoogleRedirectUri =
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
  new ExpoSecureStoreBackend()
);
