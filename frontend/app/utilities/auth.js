import { CURRENT_KDF_ITERATIONS } from './cryptoParams.js';

const encodeBase64 = (bytes) =>
    btoa(String.fromCharCode(...new Uint8Array(bytes)));

const decodeBase64 = (value) =>
    Uint8Array.from(atob(value), character => character.charCodeAt(0));

export async function hashPassword(password, salt, iterations = CURRENT_KDF_ITERATIONS) {
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const hash = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: new Uint8Array(salt),
            iterations,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    return encodeBase64(hash);
}

export async function createLoginProof(password, salt, nonce, iterations = CURRENT_KDF_ITERATIONS) {
    const verifier = decodeBase64(await hashPassword(password, salt, iterations));
    const hmacKey = await crypto.subtle.importKey(
        "raw",
        verifier,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const proof = await crypto.subtle.sign(
        "HMAC",
        hmacKey,
        decodeBase64(nonce)
    );

    return encodeBase64(proof);
}
