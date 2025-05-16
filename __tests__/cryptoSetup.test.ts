import * as ethers from "../cryptoSetup"; // Adjusted path

describe("Custom Ethers Setup", () => {
  it("should use the custom pbkdf2 implementation", () => {
    console.log("Attempting to use ethers.pbkdf2 from cryptoSetup...");

    // Mock console.info to capture the log from cryptoSetup.ts
    const consoleInfoSpy = jest
      .spyOn(console, "info")
      .mockImplementation(() => {});

    const password = "password";
    const salt = "salt";
    const iterations = 2048; // Standard iterations
    const keylen = 32; // 256-bit key
    const algo = "sha256";

    const derivedKey = ethers.pbkdf2(
      ethers.toUtf8Bytes(password),
      ethers.toUtf8Bytes(salt),
      iterations,
      keylen,
      algo
    );

    console.log("Derived key:", ethers.hexlify(derivedKey));

    // Check if our custom log message was called
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      "Using react-native-quick-crypto for pbkdf2"
    );

    // Restore the original console.info
    consoleInfoSpy.mockRestore();

    // You might want to add a check for the derivedKey value if you have a known-good output
    // For now, confirming the log message is a good indicator.
    expect(derivedKey).toBeDefined();
    expect(ethers.getBytes(derivedKey).length).toBe(keylen);
  });

  it("should still allow creating a random wallet", () => {
    const wallet = ethers.Wallet.createRandom();
    expect(wallet).toBeDefined();
    expect(wallet.privateKey).toMatch(/^0x[0-9a-fA-F]{64}$/);
    console.log("Successfully created a random wallet:", wallet.address);
  });
});
