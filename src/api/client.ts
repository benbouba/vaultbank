const BASE = import.meta.env.VITE_API_URL as string;

interface ApiError {
  error: string;
  errors?: { field: string; message: string }[];
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    kycVerified: boolean;
    accountNumber: string;
    balance: number;
    createdAt: string;
  };
}

export interface BvnVerifyResponse {
  verified: boolean;
  bvnMasked: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

export interface ApiTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  narration: string | null;
  recipient: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export const api = {
  auth: {
    register: (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      pin: string;
      bvn?: string;
    }) => request<AuthResponse>('POST', '/auth/register', data),

    login: (phone: string, pin: string) =>
      request<AuthResponse>('POST', '/auth/login', { phone, pin }),

    refresh: (refreshToken: string) =>
      request<AuthResponse>('POST', '/auth/refresh', { refreshToken }),

    logout: (token: string) => request<{ message: string }>('POST', '/auth/logout', {}, token),
  },

  kyc: {
    verifyBvn: (bvn: string, token: string) =>
      request<BvnVerifyResponse>('POST', '/kyc/verify-bvn', { bvn }, token),

    status: (token: string) =>
      request<{ kycVerified: boolean; bvnLinked: boolean }>('GET', '/kyc/status', undefined, token),
  },

  accounts: {
    me: (token: string) =>
      request<{
        accountNumber: string;
        balance: number;
        currency: string;
        kycVerified: boolean;
        bvnLinked: boolean;
        owner: { firstName: string; lastName: string; email: string; phone: string; createdAt: string };
      }>('GET', '/accounts/me', undefined, token),
  },

  transactions: {
    list: (token: string, page = 1) =>
      request<{ data: ApiTransaction[]; pagination: { page: number; total: number; pages: number } }>(
        'GET',
        `/transactions?page=${page}`,
        undefined,
        token,
      ),

    transfer: (
      token: string,
      data: { recipientAccountNumber: string; recipientBank: string; amount: number; narration?: string },
    ) => request<{ reference: string; status: string; newBalance: number }>('POST', '/transactions/transfer', data, token),

    airtime: (token: string, data: { phone: string; network: string; amount: number }) =>
      request<{ reference: string; status: string; newBalance: number }>('POST', '/transactions/airtime', data, token),

    bill: (
      token: string,
      data: { provider: string; plan?: string; customerId: string; amount: number; type: string },
    ) => request<{ reference: string; status: string; newBalance: number }>('POST', '/transactions/bill', data, token),
  },
};
