import { webcrypto } from "crypto";
const crypto = webcrypto;
export async function generateKey(password,salt) {
  const enc = new TextEncoder().encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    "raw", 
    enc,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,                           // number of hashing rounds
      hash: "SHA-256",                              // hash algorithm used
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 }, // AES key length = 256 bits
    false,
    ["encrypt", "decrypt"]
  );
  return {key, salt: Array.from(salt) };
}

//Encrypt plain text using AES-GCM
export async function encryptText(plain, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // random 96-bit IV
  const encoded = new TextEncoder().encode(plain);       // encode text to bytes

  // Perform encryption
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Convert cipher to base64 for easy storage
  return {
    iv: Array.from(iv), // store IV as an array
    data: btoa(String.fromCharCode(...new Uint8Array(cipher))) // encode binary to base64
  };
}

// Decrypt text encrypted by encryptText
export async function decryptText(cipher, key) {
  const iv = new Uint8Array(cipher.iv);
  const data = Uint8Array.from(atob(cipher.data), character => character.charCodeAt(0));
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(plain);
}
