export async function decryptText(cipher, key) {
  const iv = new Uint8Array(cipher.iv);
  const data = Uint8Array.from(atob(cipher.data), c => c.charCodeAt(0));

  // Perform decryption
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(plain); // decode bytes to string
}