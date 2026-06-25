import { create } from "zustand";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  totalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  totalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
