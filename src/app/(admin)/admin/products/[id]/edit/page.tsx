// src/app/(admin)/admin/products/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import ProductForm from "@/components/admin/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (cancelled) return;
      if (snap.exists()) {
        setProduct({
          id: snap.id,
          ...snap.data(),
          createdAt: snap.data().createdAt?.toDate(),
          updatedAt: snap.data().updatedAt?.toDate(),
        } as Product);
      }
      setLoading(false);
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="h-64 bg-gray-200 animate-pulse" />;
  }

  if (!product) {
    return <p className="text-gray-500">Product not found.</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
