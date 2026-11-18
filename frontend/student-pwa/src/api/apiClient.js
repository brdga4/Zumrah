import {
  clearAccessToken,
  getAccessToken,
  notifyAuthChange,
} from "../Features/Auth/authSession.js";

export async function authenticatedFetch(input, options = {}) {
  const token = getAccessToken();

  if (!token) {
    // Let existing guards recheck the session without sending an anonymous request.
    notifyAuthChange();
    const error = new Error("Authentication required. Please sign in again.");
    error.name = "AuthenticationError";
    error.status = 401;
    throw error;
  }

  // Copy headers so adding the current JWT does not mutate the caller's headers.
  const headers = new Headers(
    options.headers ?? (input instanceof Request ? input.headers : undefined),
  );
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, { ...options, headers });

  // End the session only if the failed request used the currently stored token.
  if (response.status === 401) {
    clearAccessToken(token);
  }

  // Preserve the original response for feature-specific parsing and error handling.
  return response;
}
