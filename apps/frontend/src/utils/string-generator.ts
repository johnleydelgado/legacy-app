
const generateSecretHash = async (username: string) => {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(process.env.COGNITO_APPLICATION_CLIENT_SECRET || ""),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(username + process.env.COGNITO_APPLICATION_CLIENT_ID),
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export {
    generateSecretHash
}
