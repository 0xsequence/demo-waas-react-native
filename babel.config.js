module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            crypto: "react-native-quick-crypto",
            stream: "readable-stream",
            buffer: "@craftzdog/react-native-buffer",
            "@ethersproject/pbkdf2":
              "./react-native-quick-crypto-ethers-patch.js",
          },
        },
      ],
    ],
  };
};
