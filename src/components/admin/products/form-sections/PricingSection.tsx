// src/components/admin/products/form-sections/PricingSection.tsx
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { ProductFormData } from "../ProductForm";
import { KRW_TO_CAD } from "@/constants/shipping";

interface Props {
  register: UseFormRegister<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
}

export default function PricingSection({ register, watch }: Props) {
  return (
    <div className="bg-white border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Pricing
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Sale Price (CAD) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="input-base pl-7"
              placeholder="0.00"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Original Price (KRW)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ₩
            </span>
            <input
              {...register("originalPrice", { valueAsNumber: true })}
              type="number"
              className="input-base pl-7"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {watch("originalPrice") > 0 && (
        <p className="text-xs text-gray-400">
          ≈ ${(watch("originalPrice") * KRW_TO_CAD).toFixed(2)} CAD (reference
          rate)
        </p>
      )}
    </div>
  );
}
