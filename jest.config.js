module.exports = {
  preset: "react-native", // This preset is good for React Native projects
  setupFilesAfterEnv: [], // You can add setup files here if needed later
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Use babel-jest for transformations
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Jest will automatically look for tests in __tests__ folders
  // and for files with .test.js, .spec.js, .test.tsx, .spec.tsx extensions.
  // You might want to explicitly tell Jest where your tests are:
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|expo(nent)?|@expo(nent)?/.*|react-navigation|@sentry/react-native|react-native-url-polyfill|react-native-quick-crypto)",
    // Add other modules that need transpiling here, e.g.
    // 'node_modules/(?!another-module-that-needs-transpiling)/'
  ],
  // Some common module name mappers for React Native:
  moduleNameMapper: {
    // For example, if you have assets or styles that Jest can't handle:
    // '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
    //   '<rootDir>/__mocks__/fileMock.js',
    // '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  // If you're using specific paths in tsconfig.json that Jest needs to know about:
  // modulePaths: ['<rootDir>'],
  // coverageReporters: ['json', 'lcov', 'text', 'clover'], // Optional: for coverage reports
};
