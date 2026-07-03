// src/components/admin/products/form-sections/BasicInfoSection.tsx
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ProductFormData } from "../ProductForm";

interface Props {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export default function BasicInfoSection({ register, errors }: Props) {
  return (
    <div className="bg-white border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Basic Info
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input {...register("name")} className="input-base" />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Brand *
          </label>
          <input {...register("brand")} className="input-base" />
          {errors.brand && (
            <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="input-base resize-none"
          placeholder="Product details, material, fit notes..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Musinsa URL
        </label>
        <input
          {...register("musinsaUrl")}
          className="input-base"
          placeholder="https://www.musinsa.com/products/..."
        />
      </div>
    </div>
  );
}
