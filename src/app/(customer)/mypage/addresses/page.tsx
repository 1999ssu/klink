// src/app/(customer)/mypage/addresses/page.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAddress } from "@/hooks/useAddress";
import { Address } from "@/types";
import AddressPopup from "@/components/customer/checkout/AddressPopup";

export default function AddressesPage() {
  const { user } = useAuthStore();
  const { removeAddress, setDefaultAddress } = useAddress();
  const [showAddPopup, setShowAddPopup] = useState(false);

  const addresses = user?.addresses ?? [];

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Address Book</h2>
        <button
          onClick={() => setShowAddPopup(true)}
          className="flex items-center gap-2 btn-primary text-sm py-2"
        >
          <Plus size={14} />
          Add Address
        </button>
      </div>

      {/* 주소 목록 */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300">
          <p className="text-gray-400 text-sm mb-3">No saved addresses.</p>
          <button
            onClick={() => setShowAddPopup(true)}
            className="text-primary text-sm hover:underline"
          >
            + Add your first address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className={`border p-5 transition-colors
                ${address.isDefault ? "border-primary bg-cream" : "border-gray-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* 주소 정보 */}
                <div className="flex-1 text-sm space-y-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.isDefault && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-semibold 
                                       text-primary border border-primary px-1.5 py-0.5"
                      >
                        <Check size={9} />
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{address.street}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                  <p className="text-gray-400 text-xs mt-1">{address.phone}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(address.id)}
                      className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600
                                 hover:border-primary hover:text-primary transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => removeAddress(address.id)}
                    className="flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 
                               border border-gray-300 text-gray-400 hover:border-red-400 
                               hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 주소 추가 팝업 */}
      {showAddPopup && (
        <AddressPopup
          onClose={() => setShowAddPopup(false)}
          onSaved={() => setShowAddPopup(false)}
        />
      )}
    </div>
  );
}
