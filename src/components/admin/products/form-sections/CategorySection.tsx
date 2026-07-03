// src/components/admin/products/form-sections/CategorySection.tsx
import { UseFormRegister } from "react-hook-form";
import { ProductFormData } from "../ProductForm";
import { ProductSubcategory } from "@/types";

const SUBCATEGORIES: ProductSubcategory[] = [
  "tops",
  "pants",
  "outerwear",
  "shoes",
  "hats",
  "accessories",
];

interface Props {
  register: UseFormRegister<ProductFormData>;
}

export default function CategorySection({ register }: Props) {
  return (
    <div className="bg-white border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Category & Status
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select {...register("category")} className="input-base">
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Subcategory *
          </label>
          <select {...register("subcategory")} className="input-base">
            {SUBCATEGORIES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select {...register("status")} className="input-base">
            <option value="active">Active</option>
            <option value="sold_out">Sold Out</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    </div>
  );
}
