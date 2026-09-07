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

export default client;
