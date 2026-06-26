// src/components/admin/products/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  Product,
  ProductCategory,
  ProductSubcategory,
  ProductStatus,
} from "@/types";
import { Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

// ── KRW → CAD 환율 변환 (대략적인 값, 실제론 환율 API 사용 권장)
const KRW_TO_CAD = 0.00105;

// 변경 후 — .default() 전부 제거
const productSchema = z.object({
  name: z.string().min(1, "Required"),
  brand: z.string().min(1, "Required"),
  description: z.string(), // ← default 제거
  price: z.coerce.number().min(0.01, "Required"),
  originalPrice: z.coerce.number(), // ← default 제거
  category: z.enum(["men", "women", "unisex"]),
  subcategory: z.enum([
    "tops",
    "pants",
    "skirts",
    "dresses",
    "outerwear",
    "shoes",
    "hats",
    "accessories",
  ]),
  status: z.enum(["active", "sold_out", "hidden"]),
  musinsaUrl: z.string(), // ← default 제거
  sizes: z
    .array(
      z.object({
        label: z.string().min(1, "Required"),
        stock: z.number().min(0),
      }),
    )
    .min(1, "Add at least one size"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  product?: Product; // 수정 시 기존 상품
  prefill?: {
    // 크롤링에서 넘어온 초기값
    name?: string;
    brand?: string;
    originalPrice?: number;
    musinsaUrl?: string;
  };
}

const SUBCATEGORIES: ProductSubcategory[] = [
  "tops",
  "pants",
  // "skirts",
  // "dresses",
  "outerwear",
  "shoes",
  "hats",
  "accessories",
];

export default function ProductForm({ product, prefill }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  // 이미지 상태 (기존 URL + 새로 업로드할 파일)
  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images ?? [],
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    // setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? prefill?.name ?? "",
      brand: product?.brand ?? prefill?.brand ?? "",
      description: product?.description ?? "",
      price:
        product?.price ??
        (prefill?.originalPrice
          ? Math.ceil(prefill.originalPrice * KRW_TO_CAD * 100) / 100
          : 0),
      originalPrice: product?.originalPrice ?? prefill?.originalPrice ?? 0,
      category: product?.category ?? "men",
      subcategory: product?.subcategory ?? "tops",
      status: product?.status ?? "active",
      musinsaUrl: product?.musinsaUrl ?? prefill?.musinsaUrl ?? "",
      sizes: product?.sizes ?? [{ label: "", stock: 0 }],
    },
  });

  // 사이즈 동적 필드
  const { fields, append, remove } = useFieldArray({ control, name: "sizes" });

  // 이미지 파일 선택
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setNewImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  // 기존 이미지 삭제 (Storage에서도 삭제)
  const removeExistingImage = async (url: string) => {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch {
      // 이미 없는 경우 무시
    }
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  // 새 이미지 미리보기 제거
  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 폼 제출
  const onSubmit = async (data: ProductFormData) => {
    setUploading(true);
    try {
      // 새 이미지 Firebase Storage 업로드
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const fileName = `products/${uuidv4()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      if (isEdit && product) {
        // 수정
        await updateDoc(doc(db, "products", product.id), {
          ...data,
          images: allImages,
          updatedAt: serverTimestamp(),
        });
        toast.success("Product updated!");
      } else {
        // 신규 등록
        await addDoc(collection(db, "products"), {
          ...data,
          images: allImages,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Product added!");
      }

      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product.");
    } finally {
      setUploading(false);
    }
  };

  const isLoading = isSubmitting || uploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 기본 정보 */}
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
              <p className="text-xs text-red-500 mt-1">
                {errors.brand.message}
              </p>
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

        {/* 무신사 URL */}
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

      {/* 가격 */}
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
            {errors.price && (
              <p className="text-xs text-red-500 mt-1">
                {errors.price.message}
              </p>
            )}
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

        {/* 환율 참고 */}
        {watch("originalPrice") > 0 && (
          <p className="text-xs text-gray-400">
            ≈ ${(watch("originalPrice") * KRW_TO_CAD).toFixed(2)} CAD (reference
            rate)
          </p>
        )}
      </div>

      {/* 카테고리 + 상태 */}
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

      {/* 사이즈 (북미 기준) */}
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

      {/* 이미지 업로드 */}
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Product Images
        </h2>
        <p className="text-xs text-gray-400">
          ※ Images must be uploaded manually (not crawled) for copyright
          compliance.
        </p>

        {/* 이미지 그리드 */}
        <div className="grid grid-cols-4 gap-3">
          {/* 기존 이미지 */}
          {existingImages.map((url) => (
            <div key={url} className="relative aspect-[3/4] bg-gray-100 group">
              <Image src={url} alt="product" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(url)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {/* 새 이미지 미리보기 */}
          {newImagePreviews.map((preview, i) => (
            <div
              key={preview}
              className="relative aspect-[3/4] bg-gray-100 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {/* 업로드 버튼 */}
          <label
            className="aspect-[3/4] border-2 border-dashed border-gray-300 
                            flex flex-col items-center justify-center gap-2 
                            cursor-pointer hover:border-primary hover:text-primary 
                            transition-colors text-gray-400"
          >
            <Upload size={20} />
            <span className="text-xs">Add Image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </label>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? uploading
              ? "Uploading images..."
              : "Saving..."
            : isEdit
              ? "Update Product"
              : "Add Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="btn-outline px-6"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
