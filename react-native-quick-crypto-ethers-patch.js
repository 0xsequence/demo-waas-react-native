const crypto = require("react-native-quick-crypto");

const pbkdf2 = (password, salt, iterations, keylen, digest) => {
  console.info("Using react-native-quick-crypto for pbkdf2");
  return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
};

exports.pbkdf2 = pbkdf2;
