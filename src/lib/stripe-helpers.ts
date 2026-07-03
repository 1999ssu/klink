// src/lib/stripe-helpers.ts
// create-payment-intent와 webhook에서 중복되던 금액 계산 로직

import { SHIPPING_COST_CAD, TAX_RATE } from "@/constants/shipping";

export interface PriceBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function calculateBreakdown(
  items: { price: number; quantity: number }[],
): PriceBreakdown {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = SHIPPING_COST_CAD;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
