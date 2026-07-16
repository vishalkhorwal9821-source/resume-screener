const configuredApi = import.meta.env.VITE_API_URL?.trim();
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const API = configuredApi || (isLocalhost ? "http://127.0.0.1:8000" : "/api");

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, { token, headers = {}, ...options } = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...authHeaders(token),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string") message = payload.detail;
      else if (payload?.detail?.message) message = payload.detail.message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response;
}
