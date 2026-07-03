// src/components/admin/products/form-sections/SizesSection.tsx
import {
  UseFormRegister,
  FieldErrors,
  UseFieldArrayReturn,
} from "react-hook-form";
import { ProductFormData } from "../ProductForm";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  fields: UseFieldArrayReturn<ProductFormData, "sizes">["fields"];
  append: UseFieldArrayReturn<ProductFormData, "sizes">["append"];
  remove: UseFieldArrayReturn<ProductFormData, "sizes">["remove"];
}

export default function SizesSection({
  register,
  errors,
  fields,
  append,
  remove,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Sizes (North American)
        </h2>
        <button
          type="button"
          onClick={() => append({ label: "", stock: 0 })}
          className="flex items-center gap-1 text-xs text-primary border border-primary 
                     px-3 py-1.5 hover:bg-primary hover:text-white transition-colors"
        >
          <Plus size={12} />
          Add Size
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3">
            <div className="flex-1">
              <input
                {...register(`sizes.${index}.label`)}
                placeholder="e.g. S, M, L, XL, 95, 100"
                className="input-base text-sm"
              />
            </div>
            <div className="w-28">
              <input
                {...register(`sizes.${index}.stock`, { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="Stock"
                className="input-base text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors 
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {errors.sizes && (
        <p className="text-xs text-red-500">{errors.sizes.message}</p>
      )}
      <p className="text-xs text-gray-400">
        ※ Use North American sizing (XS/S/M/L/XL or numeric like 28/30/32)
      </p>
    </div>
  );
}
