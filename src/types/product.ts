// src/types/product.ts
export interface ProductSize {
  label: string;
  stock: number;
}

export type ProductCategory = "men" | "women" | "unisex";

export type ProductSubcategory =
  | "tops"
  | "pants"
  | "skirts"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "hats"
  | "accessories";

export type ProductStatus = "active" | "sold_out" | "hidden";

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  images: string[];
  sizes: ProductSize[];
  status: ProductStatus;
  musinsaUrl?: string;
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
