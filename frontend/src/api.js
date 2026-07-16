const configuredApi = import.meta.env.VITE_API_URL?.trim();
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const API = configuredApi || (isLocalhost ? "http://127.0.0.1:8000" : "/api");

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, { token, headers = {}, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...authHeaders(token),
        ...headers,
      },
    });
  } catch {
    throw new Error(`Cannot reach API at ${API}. Set VITE_API_URL to your backend deployment URL.`);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string") message = payload.detail;
      else if (payload?.detail?.message) message = payload.detail.message;
      else if (typeof payload?.message === "string") message = payload.message;
    } catch {
      if (response.statusText) message = response.statusText;
    }
    throw new Error(`${message} [${API}${path}]`);
  }

  return response;
}
