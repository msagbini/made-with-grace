import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use((config) => {
  // Agregar token si existe (futuro)
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  },
);

// ============================================
// Products API
// ============================================

export const productsApi = {
  getCategories: async () => {
    const { data } = await client.get('/products/categories');
    return data;
  },

  getCategoryBySlug: async (slug: string) => {
    const { data } = await client.get(`/products/categories/${slug}`);
    return data;
  },

  getProducts: async (page = 1, limit = 20) => {
    const { data } = await client.get('/products/list', {
      params: { page, limit },
    });
    return data;
  },

  getProductBySlug: async (slug: string) => {
    const { data } = await client.get(`/products/${slug}`);
    return data;
  },
};

// ============================================
// Orders API
// ============================================

export const ordersApi = {
  createOrder: async (order: any) => {
    const { data } = await client.post('/orders', order);
    return data;
  },

  getOrder: async (id: string) => {
    const { data } = await client.get(`/orders/${id}`);
    return data;
  },

  getOrdersByEmail: async (email: string) => {
    const { data } = await client.get(`/orders/by-email/${email}`);
    return data;
  },

  cancelOrder: async (id: string) => {
    const { data } = await client.put(`/orders/${id}/cancel`);
    return data;
  },
};

// ============================================
// Payments API
// ============================================

export const paymentsApi = {
  createPaymentIntent: async (orderId: string, amount: number) => {
    const { data } = await client.post('/payments/intent', {
      orderId,
      amount,
    });
    return data;
  },

  getPaymentStatus: async (orderId: string) => {
    const { data } = await client.get(`/payments/${orderId}`);
    return data;
  },
};

// ============================================
// Files API
// ============================================

export const filesApi = {
  upload: async (file: File, customerId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (customerId) {
      formData.append('customerId', customerId);
    }

    const { data } = await client.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

// ============================================
// Health API
// ============================================

export const healthApi = {
  check: async () => {
    try {
      const { data } = await client.get('/health');
      return data;
    } catch {
      return { status: 'offline' };
    }
  },
};

// ============================================
// Admin API
// ============================================

export const adminApi = {
  // Auth
  login: async (email: string, password: string) => {
    const { data } = await client.post('/admin/auth/login', { email, password });
    return data;
  },

  register: async (email: string, password: string, name: string) => {
    const { data } = await client.post('/admin/auth/register', { email, password, name });
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await client.get('/admin/auth/me');
    return data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const { data } = await client.get('/admin/stats');
    return data;
  },

  // Orders
  getOrders: async (page = 1, limit = 20, status?: string, search?: string) => {
    const { data } = await client.get('/admin/orders', {
      params: { page, limit, status, search },
    });
    return data;
  },

  getOrder: async (id: string) => {
    const { data } = await client.get(`/admin/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (id: string, status: string, notes?: string) => {
    const { data } = await client.put(`/admin/orders/${id}/status`, { status, notes });
    return data;
  },

  // Products
  getAdminProducts: async (page = 1, limit = 20, search?: string, categoryId?: string) => {
    const { data } = await client.get('/admin/products', {
      params: { page, limit, search, categoryId },
    });
    return data;
  },

  getAdminProduct: async (id: string) => {
    const { data } = await client.get(`/admin/products/${id}`);
    return data;
  },

  createProduct: async (product: any) => {
    const { data } = await client.post('/admin/products', product);
    return data;
  },

  updateProduct: async (id: string, product: any) => {
    const { data } = await client.put(`/admin/products/${id}`, product);
    return data;
  },

  deleteProduct: async (id: string) => {
    const { data } = await client.delete(`/admin/products/${id}`);
    return data;
  },

  // Categories
  getAdminCategories: async (page = 1, limit = 20) => {
    const { data } = await client.get('/admin/categories', {
      params: { page, limit },
    });
    return data;
  },

  getAdminCategory: async (id: string) => {
    const { data } = await client.get(`/admin/categories/${id}`);
    return data;
  },

  createCategory: async (category: any) => {
    const { data } = await client.post('/admin/categories', category);
    return data;
  },

  updateCategory: async (id: string, category: any) => {
    const { data } = await client.put(`/admin/categories/${id}`, category);
    return data;
  },

  deleteCategory: async (id: string) => {
    const { data } = await client.delete(`/admin/categories/${id}`);
    return data;
  },
};

export default client;
