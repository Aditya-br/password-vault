const randomInt = (max) => {
    const range = 0x100000000;
    const limit = Math.floor(range / max) * max;
    const values = new Uint32Array(1);
    do {
        crypto.getRandomValues(values);
    } while (values[0] >= limit);
    return values[0] % max;
};

export function generatePassword(length, options) {
    const lookalikes = new Set(["I", "l", "1", "O", "0"]);
    const characterSets = [
        options.useUppercase && "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        options.useLowercase && "abcdefghijklmnopqrstuvwxyz",
        options.useNumbers && "0123456789",
        options.useSpecial && "!@#$%^&*()-_=+[]{}|;:,.<>?"
    ]
        .filter(Boolean)
        .map(characters => options.useLookAlikes
            ? [...characters].filter(character => !lookalikes.has(character)).join("")
            : characters)
        .filter(characters => characters.length > 0);

    if (!Number.isInteger(length) || length < 1 || characterSets.length === 0) {
        throw new Error("Choose a valid length and at least one character type");
    }

    const allCharacters = characterSets.join("");
    const password = characterSets.map(characters => characters[randomInt(characters.length)]);
    while (password.length < length) {
        password.push(allCharacters[randomInt(allCharacters.length)]);
    }

    for (let index = password.length - 1; index > 0; index -= 1) {
        const swapIndex = randomInt(index + 1);
        [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
    }

    return password.join("");
}
