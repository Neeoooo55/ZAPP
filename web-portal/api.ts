export type BackendUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'tradesperson';
  trades?: string[];
  businessInfo?: { businessName?: string; licenseNumber?: string };
  address?: { street?: string; city?: string; state?: string; zipCode?: string };
  rating?: { average?: number; totalReviews?: number };
};

export type Job = {
  _id: string;
  category: string;
  description: string;
  location?: { address?: string };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'declined';
  urgency?: 'standard' | 'urgent' | 'emergency';
  pricingType?: 'hourly' | 'fixed' | 'emergency_fee';
  actualCost?: number;
  completionDetails?: {
    hoursWorked?: number;
    finalCost?: { subtotal?: number; platformFee?: number; total?: number };
    notes?: string;
  };
  timeline?: { requestedAt?: string; acceptedAt?: string; startedAt?: string; completedAt?: string };
};

const base = '/api';

const json = (res: Response) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const api = {
  // Auth
  status: () => fetch(`${base}/auth/status`, { credentials: 'include' }).then(json),
  login: (email: string, password: string) =>
    fetch(`${base}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(json),
  register: (userData: Record<string, unknown>) =>
    fetch(`${base}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(json),
  logout: () => fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' }).then(json),
  me: () => fetch(`${base}/auth/me`, { credentials: 'include' }).then(json),

  // Tradespeople
  profile: () => fetch(`${base}/tradespeople/profile`, { credentials: 'include' }).then(json),
  updateProfile: (updates: Record<string, unknown>) =>
    fetch(`${base}/tradespeople/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(json),
  jobs: () => fetch(`${base}/tradespeople/jobs`, { credentials: 'include' }).then(json),
};

