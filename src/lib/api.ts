const API_BASE = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('printpod-auth') || '{}')?.state?.token
      : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  signup: (data: { email: string; password: string; name: string; username: string }) =>
    request<{ user: any; token: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<{ user: any }>('/auth/me'),

  // Products
  getProducts: (params?: string) =>
    request<{ products: any[]; total: number }>(`/products${params ? `?${params}` : ''}`),
  getProduct: (id: string) =>
    request<{ product: any }>(`/products/${id}`),
  createProduct: (data: FormData) =>
    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('printpod-auth') || '{}')?.state?.token}`,
      },
      body: data,
    }).then((r) => r.json()),
  updateProduct: (id: string, data: any) =>
    request<{ product: any }>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Stores
  getStore: (username: string) =>
    request<{ store: any; products: any[] }>(`/stores/${username}`),

  // Orders
  createOrder: (data: any) =>
    request<{ order: any }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () =>
    request<{ orders: any[] }>('/orders'),

  // Admin
  adminGetProducts: (status?: string) =>
    request<{ products: any[] }>(`/admin/products${status ? `?status=${status}` : ''}`),
  adminUpdateProduct: (id: string, data: { status: string; rejection_reason?: string }) =>
    request<{ product: any }>(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminGetOrders: () =>
    request<{ orders: any[] }>('/admin/orders'),
  adminUpdateOrder: (id: string, data: { status: string }) =>
    request<{ order: any }>(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminGetUsers: () =>
    request<{ users: any[] }>('/admin/users'),
  adminGetStats: () =>
    request<{ stats: any }>('/admin/stats'),

  // Upload
  uploadImage: (file: File, bucket: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    return fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem('printpod-auth') || '{}')?.state?.token}`,
      },
      body: formData,
    }).then((r) => r.json());
  },
};
