export type UserRole = "customer" | "admin";

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductSize {
  label: string; // 'S' | 'M' | 'L' | 'XL' | '95' | '100' | '105' 등
  stock: number;
}

export type ProductCategory = "men" | "women" | "unisex";
export type ProductSubcategory =
  | "tops"
  | "pants"
  | "shoes"
  | "hats"
  | "accessories"
  | "outerwear";
export type ProductStatus = "active" | "sold_out" | "hidden";

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number; // CAD
  originalPrice?: number; // KRW (참고용)
  category: ProductCategory;
  subcategory: ProductSubcategory;
  images: string[];
  sizes: ProductSize[];
  status: ProductStatus;
  musinsaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  price: number; // CAD
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

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  quantity: number;
}

export interface WishItem {
  productId: string;
  product: Product;
  addedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  addresses: Address[];
  createdAt: Date;
}
