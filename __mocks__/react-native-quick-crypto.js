// __mocks__/react-native-quick-crypto.js

// Mock for the named import: import { install } from "react-native-quick-crypto";
const install = jest.fn();

// Mocks for functions accessed via the default import: import crypto from "react-native-quick-crypto";
const mockPbkdf2Sync = jest.fn(
  (_password, _salt, _iterations, keylen, _algo) => {
    // This console.log can be useful for debugging the mock itself
    // console.log(`Mocked react-native-quick-crypto.pbkdf2Sync called, returning Uint8Array of length: ${keylen}`);
    return new Uint8Array(keylen); // Return a buffer of the expected length
  }
);

const mockGetRandomValues = jest.fn((array) => {
  // console.log('Mocked react-native-quick-crypto.getRandomValues called');
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256); // Fill with some dummy data
  }
  return array;
});

module.exports = {
  install,
  default: {
    pbkdf2Sync: mockPbkdf2Sync,
    getRandomValues: mockGetRandomValues,
  },
  // It can also be helpful to export these directly if any code tries to destructure them
  // from the main module export, though cryptoSetup.ts uses the default export for these.
  pbkdf2Sync: mockPbkdf2Sync,
  getRandomValues: mockGetRandomValues,
};
