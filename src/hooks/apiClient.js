// hooks/apiClient.js
//
// Single fetch wrapper for every hook in the app. Centralizes:
//   - base URL, auth header, credentials
//   - 401 handling: instead of each hook deciding what a dead session means,
//     every 401 funnels through one callback that App.jsx registers once,
//     on mount, pointed at setView('login').
//
// This is a plain module-level singleton, not Context — there's exactly one
// consumer (App.jsx) and one producer slot, so a Context provider would just
// be ceremony around a single function reference.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

let unauthorizedHandler = null;
let hasNotified = false; // guards against multiple simultaneous 401s
                          // (e.g. profile + savings/settings failing in the
                          // same render) firing the redirect more than once

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
  hasNotified = false; // reset the guard whenever a new handler is registered
                        // (i.e. on every fresh mount/login)
}

function notifyUnauthorized() {
  if (hasNotified) return;
  hasNotified = true;
  if (unauthorizedHandler) {
    unauthorizedHandler();
  }
}

// Call this once, right after a successful login, so the *next* 401 (from
// whatever query fires first after the token is set) is treated as a fresh
// session and can trigger the redirect again if it ever goes stale.
export function resetUnauthorizedGuard() {
  hasNotified = false;
}

/**
 * apiFetch(path, options)
 *
 * - path: e.g. '/auth/profile', '/savings/settings'
 * - options: same shape as fetch's second arg, plus an optional `skipAuth`
 *   flag for routes that don't need a token (signup/login themselves)
 *
 * Always sends Authorization (if a token exists) and Content-Type: json.
 * On 401: notifies the registered handler, then still throws, so the
 * calling query/mutation ends up in its own error state too (existing
 * .isError / .error UI in components keeps working unchanged).
 */
export async function apiFetch(path, options = {}) {
  const response = await apiFetchRaw(path, options);

  if (response.status === 401) {
    notifyUnauthorized();
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'Session expired');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'Request failed');
  }

  return response.json();
}

/**
 * apiFetchRaw(path, options)
 *
 * Lower-level escape hatch for callers that need to inspect the raw
 * Response themselves — e.g. distinguishing a 404 ("nothing saved yet",
 * not an error) from other failures. Still goes through the shared 401
 * detection, so the global redirect fires regardless of which fetch
 * helper a hook uses; it just doesn't throw or parse the body for you.
 */
export async function apiFetchRaw(path, { skipAuth = false, ...options } = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (!skipAuth) {
    headers['Authorization'] = token ? `Bearer ${token}` : '';
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (response.status === 401) {
    notifyUnauthorized();
  }

  return response;
}