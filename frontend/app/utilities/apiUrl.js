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

export async function fetchApi(path, options, action) {
    try {
        return await fetch(`${getApiUrl()}${path}`, options);
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                `Could not connect to the backend while trying to ${action}. Check the backend deployment, your network connection, and browser CORS settings. If this happened during signup, try signing in before submitting signup again because the request may have reached the server.`
            );
        }
        throw error;
    }
}
