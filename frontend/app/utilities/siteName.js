const compoundPublicSuffixes = new Set([
    "ac.uk",
    "co.in",
    "co.jp",
    "co.nz",
    "co.uk",
    "com.au",
    "com.br",
    "com.cn",
    "com.mx",
    "com.sg",
    "com.tr",
    "net.au",
    "org.au",
    "org.uk",
]);

export function getSiteNameFromUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";

    try {
        const normalizedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(value.trim())
            ? value.trim()
            : `https://${value.trim()}`;
        const hostname = new URL(normalizedUrl).hostname
            .toLowerCase()
            .replace(/^www\./, "");
        const labels = hostname.split(".");
        const suffix = labels.slice(-2).join(".");
        const domainIndex = Math.max(
            0,
            labels.length - (compoundPublicSuffixes.has(suffix) ? 3 : 2)
        );
        const domain = labels[domainIndex];

        return domain
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
    } catch {
        return "";
    }
}
