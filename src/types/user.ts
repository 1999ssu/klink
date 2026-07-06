// src/types/user.ts
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  addresses: Address[];
  createdAt: Date;
}
