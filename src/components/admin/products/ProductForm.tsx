// src/components/admin/products/ProductForm.tsx
// 섹션 컴포넌트들을 조합하는 메인 폼
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Product } from "@/types";
import { KRW_TO_CAD } from "@/constants/shipping";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

import BasicInfoSection from "./form-sections/BasicInfoSection";
import PricingSection from "./form-sections/PricingSection";
import CategorySection from "./form-sections/CategorySection";
import SizesSection from "./form-sections/SizesSection";
import ImageSection from "./form-sections/ImageSection";
import { createDoc, updateDocById } from "@/lib/firestore-crud";

export const productSchema = z.object({
  name: z.string().min(1, "Required"),
  brand: z.string().min(1, "Required"),
  description: z.string(),
  price: z.coerce.number().min(0.01, "Required"),
  originalPrice: z.coerce.number(),
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
  musinsaUrl: z.string(),
  sizes: z
    .array(
      z.object({
        label: z.string().min(1, "Required"),
        stock: z.number().min(0),
      }),
    )
    .min(1, "Add at least one size"),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  product?: Product;
  prefill?: {
    name?: string;
    brand?: string;
    originalPrice?: number;
    musinsaUrl?: string;
    image?: string;
  };
}

export default function ProductForm({ product, prefill }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images ?? (prefill?.image ? [prefill.image] : []),
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
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

  const { fields, append, remove } = useFieldArray({ control, name: "sizes" });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveExisting = async (url: string) => {
    try {
      if (url.startsWith("https://firebasestorage")) {
        await deleteObject(ref(storage, url));
      }
    } catch {}
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const handleRemoveNew = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    setUploading(true);
    try {
      // 새 이미지 전부 업로드
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const fileName = `products/${uuidv4()}_${file.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      // 기존 이미지 + 새로 업로드한 이미지 합치기
      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        ...data,
        images: allImages,
      };

      if (isEdit && product) {
        await updateDocById("products", product.id, payload);
        toast.success("Product updated!");
      } else {
        await createDoc("products", payload);
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
      <BasicInfoSection register={register} errors={errors} />
      <PricingSection register={register} watch={watch} />
      <CategorySection register={register} />
      <SizesSection
        register={register}
        errors={errors}
        fields={fields}
        append={append}
        remove={remove}
      />
      <ImageSection
        existingImages={existingImages}
        newImagePreviews={newImagePreviews}
        onImageSelect={handleImageSelect}
        onRemoveExisting={handleRemoveExisting}
        onRemoveNew={handleRemoveNew}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? uploading
              ? "Uploading..."
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
