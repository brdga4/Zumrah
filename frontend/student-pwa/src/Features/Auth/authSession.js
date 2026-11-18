// Manage the student's JWT token in one place.

const ACCESS_TOKEN_KEY = "zumrah.student.accessToken";
const AUTH_CHANGE_EVENT = "zumrah-auth-change";

// Read only valid student tokens; do not mutate storage during React rendering.
export function getAccessToken() {
    try {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        return isTokenExpired(token) ? null : token;
    } catch {
        return null;
    }
}

export function setAccessToken(token) {
    if (isTokenExpired(token)) {
        throw new Error("Cannot save an invalid or expired access token.");
    }

    // Let the existing Login/OTP error handling report unavailable storage.
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    notifyAuthChange();
}

// An expiration timer may remove only the token it was created for.
export function clearAccessToken(expectedToken) {
    try {
        if (
            expectedToken === undefined ||
            localStorage.getItem(ACCESS_TOKEN_KEY) === expectedToken
        ) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
    } catch {
        // Still notify subscribers so they reject inaccessible storage safely.
    }
    notifyAuthChange();
}

// Decode claims for client-side expiry checks, not signature verification.
export function getTokenExpirationTime(token) {
    if (typeof token !== "string") return null;

    const parts = token.split(".");
    if (
        parts.length !== 3 ||
        parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part) || part.length % 4 === 1)
    ) {
        return null;
    }

    try {
        const [header, payload] = parts.slice(0, 2).map((part) => {
            const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
            const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
            return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
        });

        if (
            !header || typeof header !== "object" || Array.isArray(header) ||
            typeof header.alg !== "string" || !header.alg ||
            !payload || typeof payload !== "object" || Array.isArray(payload) ||
            typeof payload.exp !== "number" ||
            !Number.isFinite(payload.exp) ||
            !Number.isFinite(payload.exp * 1000)
        ) {
            return null;
        }

        return payload.exp * 1000;
    } catch {
        return null;
    }
}

// Missing or malformed expiration claims fail closed, just like expired tokens.
export function isTokenExpired(token) {
    const expirationTime = getTokenExpirationTime(token);
    return expirationTime === null || expirationTime <= Date.now();
}

// Notify the app when authentication changes.
export function notifyAuthChange() {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}


// Listen for changes to the student's login session.
export function subscribeToAuthChanges(callback) {
  function handleStorage(event) {
    if (event.key !== ACCESS_TOKEN_KEY && event.key !== null) return;

    try {
      if (event.storageArea !== localStorage) return;
    } catch {
      // A storage policy change must also make active guards recheck the session.
    }
    callback();
  }

  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}
