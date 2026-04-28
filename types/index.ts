// types/index.ts
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  category: string;
  tags: string[];
  variants: ProductVariant[];
  stock: number;
  sku?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  reviews?: Review[];
  _count?: { reviews: number };
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: Record<string, string>;
  slug: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  promoCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { name: string | null; email: string };
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: Record<string, string>;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  country: string;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  user?: { name: string | null; image: string | null };
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: "PERCENT" | "FIXED";
  maxUses?: number | null;
  currentUses: number;
  expiresAt?: Date | null;
  isActive: boolean;
}

export interface DexpayPaymentInit {
  amount: number;
  email: string;
  name: string;
  orderId: string;
  currency?: string;
  callback_url: string;
  cancel_url?: string;
  metadata?: Record<string, unknown>;
}

export interface DexpayPaymentResponse {
  payment_url: string;
  reference: string;
  status: string;
}

export interface DexpayVerifyResponse {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface ShippingZone {
  name: string;
  cities: string[];
  price: number;
  estimatedDays: string;
}
