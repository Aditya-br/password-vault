export function getApiUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!configuredUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const apiUrl = new URL(configuredUrl);
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(apiUrl.hostname);
    if (process.env.NODE_ENV === "production" && apiUrl.protocol !== "https:" && !isLocalhost) {
        throw new Error("The API must use HTTPS in production");
    }

    return `${apiUrl.toString().replace(/\/+$/, "")}/`;
}
