import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      "coverage/",
      ".expo/",
      ".vscode/",
      "babel.config.js",
      "jest.config.js",
      "__mocks__/",
      ".eslintrc.js",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        process: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        jest: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        test: "readonly",
      },
    },
    rules: {
      // NOTE: The following rules have been disabled for the demo.
      // Please do not replicate these settings in other projects without careful consideration.
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "no-var": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-var-requires": "error",

      // Suggested rule to prevent importing 'ethers' directly in files other than cryptoSetup.ts
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "ethers",
              message:
                "Please import 'ethers' from './cryptoSetup' instead to use the project-specific version.",
            },
            {
              name: "@ethersproject/pbkdf2",
              message:
                "Please import 'ethers' (which includes pbkdf2) from './cryptoSetup' instead.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["cryptoSetup.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@ethersproject/pbkdf2",
              message:
                "In cryptoSetup.ts, if you need pbkdf2, it should come from the main 'ethers' import you're modifying.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["*.config.js", "eslint.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "writable",
        require: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
