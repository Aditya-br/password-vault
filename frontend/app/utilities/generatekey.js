export async function generateKey(password,salt,iterations = 100000) {
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
      iterations,                                   // number of hashing rounds
      hash: "SHA-256",                              // hash algorithm used
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 }, // AES key length = 256 bits
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}