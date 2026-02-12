import CryptoJS from "crypto-js";

// Keys provided in your documentation
const OTP_REG_KEY = CryptoJS.enc.Latin1.parse(
  "aNdRfUjXn2r5u8x/A?D(G+KbPeShVkYp",
);
const USERNAME_KEY = CryptoJS.enc.Latin1.parse(
  "Rp}ex:?zG0=&m&,DOX$X<:HI>G=LNKeL",
);
const AES_IV = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

/**
 * Encrypts data for OTP and Registration
 */
export function encryptRegistrationData(data: object): string {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), OTP_REG_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

/**
 * Encrypts data specifically for Username availability check
 */
export function encryptUsernameData(data: object): string {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), USERNAME_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}
