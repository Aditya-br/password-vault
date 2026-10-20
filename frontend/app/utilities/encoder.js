export async function encryptText(plain, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plain);
    const cipher = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoded
    );

    return {
        iv: Array.from(iv),
        data: btoa(String.fromCharCode(...new Uint8Array(cipher)))
    };
}
