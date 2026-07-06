// src/hooks/useAddress.ts
"use client";

import { useState } from "react";
import { updateDocById } from "@/lib/firestore-crud";
import { useAuthStore } from "@/store/authStore";
import { Address } from "@/types";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

export function useAddress() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // 주소 추가
  const addAddress = async (data: Omit<Address, "id">) => {
    if (!user) return;
    setLoading(true);
    try {
      const newAddress: Address = { ...data, id: uuidv4() };

      // user.addresses가 undefined일 수 있으므로 기본값 처리
      const currentAddresses = user.addresses ?? [];

      if (currentAddresses.length === 0) newAddress.isDefault = true;

      const updatedAddresses = [
        ...currentAddresses.map((a) =>
          data.isDefault ? { ...a, isDefault: false } : a,
        ),
        newAddress,
      ];

      await updateDocById("users", user.id, { addresses: updatedAddresses });
      setUser({ ...user, addresses: updatedAddresses });
      toast.success("Address saved!");
      return newAddress;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  // 주소 삭제
  const removeAddress = async (addressId: string) => {
    if (!user) return;
    const target = user.addresses.find((a) => a.id === addressId);
    if (!target) return;

    const updatedAddresses = user.addresses.filter((a) => a.id !== addressId);

    // 삭제된 게 default였으면 첫 번째 주소를 default로
    if (target.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    await updateDocById("users", user.id, { addresses: updatedAddresses });
    setUser({ ...user, addresses: updatedAddresses });
    toast.success("Address removed.");
  };

  // 기본 주소 설정
  const setDefaultAddress = async (addressId: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    await updateDocById("users", user.id, { addresses: updatedAddresses });
    setUser({ ...user, addresses: updatedAddresses });
    toast.success("Default address updated.");
  };

  return { addAddress, removeAddress, setDefaultAddress, loading };
}
