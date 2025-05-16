module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: [],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|expo(nent)?|@expo(nent)?/.*|react-navigation|@sentry/react-native|react-native-url-polyfill|react-native-quick-crypto)",
  ],
  moduleNameMapper: {},
};
