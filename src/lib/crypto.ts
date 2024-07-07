import crypto from "node:crypto";

const ALGORITHM = "aes256";
const INPUT_ENCODING = "utf8";
const OUTPUT_ENCODING = "hex";
const IV_LENGTH = 16; // AES blocksize

/**
 *
 * @param text Value to be encrypted
 * @param key Key used to encrypt value must be 32 bytes for AES256 encryption algorithm
 *
 * @returns Encrypted value using key
 */
export const Encrypted = (text: string, key: string) => {
  const _key = Buffer.from(key, "latin1");
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, _key, iv);
  let ciphered = cipher.update(text, INPUT_ENCODING, OUTPUT_ENCODING);
  ciphered += cipher.final(OUTPUT_ENCODING);
  const ciphertext = `${iv.toString(OUTPUT_ENCODING)}:${ciphered}`;
  return ciphertext;
};

/**
 *
 * @param text Value to decrypt
 * @param key Key used to decrypt value must be 32 bytes for AES256 encryption algorithm
 */
export const Decrypted = (text: string, key: string) => {
  const _key = Buffer.from(key, "latin1");

  const components = text.split(":");
  const iv_from_ciphertext = Buffer.from(
    components.shift() || "",
    OUTPUT_ENCODING,
  );
  const decipher = crypto.createDecipheriv(ALGORITHM, _key, iv_from_ciphertext);
  let deciphered = decipher.update(
    components.join(":"),
    OUTPUT_ENCODING,
    INPUT_ENCODING,
  );
  deciphered += decipher.final(INPUT_ENCODING);

  return deciphered;
};

export const createHash = async (key: string) => {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toString();
};

export const createApiToken = () => {
  return randomBytes(32).toString("base64url");
};

export const createSecureHash = (key: string) => {
  const data = new TextEncoder().encode(key);
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(data, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifySecureHash = (key: string, hash: string) => {
  const data = new TextEncoder().encode(key);
  const [salt, storedHash] = hash.split(":");
  const derivedKey = crypto.scryptSync(data, String(salt), 64);

  return storedHash === derivedKey.toString("hex");
};
