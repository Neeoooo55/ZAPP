const base = '/api';

const json = (res: Response) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const api = {
  status: () => fetch(`${base}/auth/status`, { credentials: 'include' }).then(json),
  login: (email: string, password: string) =>
    fetch(`${base}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(json),
  logout: () => fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' }).then(json),
  me: () => fetch(`${base}/auth/me`, { credentials: 'include' }).then(json),
  updateMe: (updates: Record<string, unknown>) =>
    fetch(`${base}/auth/me`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(json),

  // Admin APIs
  overview: () => fetch(`${base}/admin/overview`, { credentials: 'include' }).then(json),
  users: (role?: 'customer' | 'tradesperson' | 'admin') => {
    const q = role ? `?role=${encodeURIComponent(role)}` : '';
    return fetch(`${base}/admin/users${q}`, { credentials: 'include' }).then(json);
  },
  jobs: (status?: string) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetch(`${base}/admin/jobs${q}`, { credentials: 'include' }).then(json);
  },
  tickets: () => fetch(`${base}/admin/support/tickets`, { credentials: 'include' }).then(json),
  disputes: () => fetch(`${base}/admin/support/disputes`, { credentials: 'include' }).then(json),
  transactions: (type?: 'Payment' | 'Payout' | 'Refund') => {
    const q = type ? `?type=${encodeURIComponent(type)}` : '';
    return fetch(`${base}/admin/finance/transactions${q}`, { credentials: 'include' }).then(json);
  },
  promoCodes: () => fetch(`${base}/admin/finance/promocodes`, { credentials: 'include' }).then(json)
};

export type BackendUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'tradesperson' | 'admin';
};
