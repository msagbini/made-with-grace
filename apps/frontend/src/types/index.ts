// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description?: string;
  image?: string;
}

// Products
export interface Customization {
  type: 'text' | 'color' | 'image' | 'select';
  label: string;
  required: boolean;
  maxLength?: number;
  allowedValues?: string[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  customizations: Customization[];
  active: boolean;
}

// Cart
export interface CartCustomizations {
  text?: string;
  color?: string;
  image?: string;
  imageUrl?: string;
  [key: string]: any;
}

export interface CartItem {
  id: string; // unique per cart item
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  expressApplied: boolean;
  customizations: CartCustomizations;
  subtotal: number;
  expressFee: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  expressFee: number;
  total: number;
  lastUpdated: number;
}

// Orders
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY_FOR_PICKUP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  expressApplied: boolean;
  expressFee: number;
  subtotal: number;
  customizations: CartCustomizations;
}

export interface Order {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address: string;
  city?: string;
  zip?: string;
  country?: string;
  deliveryDate: string;
  items: OrderItem[];
  subtotal: number;
  expressFee: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  email: string;
  name: string;
  phone?: string;
  address: string;
  city?: string;
  zip?: string;
  country?: string;
  deliveryDate: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    expressApplied: boolean;
    customizations: CartCustomizations;
  }>;
  subtotal: number;
  expressFee: number;
  total: number;
  notes?: string;
}

// Payments
export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
}

export interface PaymentStatus {
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  provider: 'STRIPE' | 'MERCADOPAGO';
  amount: number;
  currency: string;
}

// API Response
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
