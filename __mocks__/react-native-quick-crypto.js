const install = jest.fn();

const mockPbkdf2Sync = jest.fn(
  (_password, _salt, _iterations, keylen, _algo) => {
    return new Uint8Array(keylen);
  }
);

const mockGetRandomValues = jest.fn((array) => {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
});

module.exports = {
  install,
  default: {
    pbkdf2Sync: mockPbkdf2Sync,
    getRandomValues: mockGetRandomValues,
  },
  pbkdf2Sync: mockPbkdf2Sync,
  getRandomValues: mockGetRandomValues,
};
