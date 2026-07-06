// src/components/admin/products/ProductForm.tsx
// 섹션 컴포넌트들을 조합하는 메인 폼
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

  const [existingImage, setExistingImage] = useState<string>(
    product?.images?.[0] ?? prefill?.image ?? "",
  );
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
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
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveExisting = async () => {
    try {
      if (existingImage.startsWith("https://firebasestorage")) {
        await deleteObject(ref(storage, existingImage));
      }
    } catch {}
    setExistingImage("");
  };

  const handleRemoveNew = () => {
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  const onSubmit = async (data: ProductFormData) => {
    setUploading(true);
    try {
      let finalImage = existingImage;

      // 새 이미지 업로드
      if (newImageFile) {
        const fileName = `products/${uuidv4()}_${newImageFile.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, newImageFile);
        finalImage = await getDownloadURL(storageRef);
      }

      const payload = {
        ...data,
        images: finalImage ? [finalImage] : [],
      };

      if (isEdit && product) {
        // 수정
        await updateDocById("products", product.id, payload);
        toast.success("Product updated!");
      } else {
        // 신규 등록
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
        existingImage={existingImage}
        newImagePreview={newImagePreview}
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
