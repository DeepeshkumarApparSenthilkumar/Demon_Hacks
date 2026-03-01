const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// ── Token storage (sessionStorage = cleared on tab close) ────────────────────
export const tokenStore = {
  get: () => sessionStorage.getItem('chi360_token'),
  set: (t) => sessionStorage.setItem('chi360_token', t),
  clear: () => sessionStorage.removeItem('chi360_token'),
};

// ── CSRF token (fetched once on app load) ─────────────────────────────────────
let csrfToken = null;

export async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch {
    console.warn('Could not fetch CSRF token');
    return null;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
export async function apiFetch(endpoint, options = {}) {
  const token = tokenStore.get();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && token !== 'demo-token' ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await res.json();

    // Auto-handle session expiry
    if (res.status === 401 && ['SESSION_TIMEOUT', 'TOKEN_EXPIRED', 'SESSION_INVALID'].includes(data.code)) {
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent('chi360:session-expired', { detail: data }));
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    // Server not running — return a network error object (don't throw)
    return { ok: false, status: 0, data: { error: 'network_error', code: 'NETWORK_ERROR' } };
  }
}

// ── Auth API calls ────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verify2FA: (body) => apiFetch('/auth/2fa/verify', { method: 'POST', body: JSON.stringify(body) }),
  setup2FA: () => apiFetch('/auth/2fa/setup', { method: 'POST' }),
  enable2FA: (body) => apiFetch('/auth/2fa/enable', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  logoutAll: () => apiFetch('/auth/logout-all', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),
};

export const userApi = {
  loginHistory: (params = '') => apiFetch(`/user/login-history${params}`),
  sessions: () => apiFetch('/user/sessions'),
  revokeSession: (id) => apiFetch(`/user/sessions/${id}`, { method: 'DELETE' }),
};