// src/types/order.ts
import { Address } from "./user";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  status: OrderStatus;
  stripePaymentIntentId: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}
