// src/components/customer/checkout/AddressListPopup.tsx
"use client";

import { X, Check, Trash2, Plus } from "lucide-react";
import { Address } from "@/types";
import { useAddress } from "@/hooks/useAddress";

interface Props {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (address: Address) => void;
  onAddNew: () => void;
  onClose: () => void;
}

export default function AddressListPopup({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
  onClose,
}: Props) {
  const { removeAddress, setDefaultAddress } = useAddress();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Saved Addresses
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border p-4 cursor-pointer transition-colors
                ${
                  selectedId === address.id
                    ? "border-primary bg-cream"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              onClick={() => onSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 선택 체크 + 기본 뱃지 */}
                  <div className="flex items-center gap-2 mb-1">
                    {selectedId === address.id && (
                      <Check size={14} className="text-primary flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium text-gray-800">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.isDefault && (
                      <span className="text-[10px] bg-primary text-white px-1.5 py-0.5">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{address.street}</p>
                  <p className="text-sm text-gray-500">
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-1 ml-3">
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaultAddress(address.id);
                      }}
                      className="text-xs text-gray-400 hover:text-primary transition-colors px-2 py-1 border border-gray-200 hover:border-primary"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAddress(address.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 새 주소 추가 버튼 */}
          <button
            onClick={onAddNew}
            className="w-full border border-dashed border-gray-300 py-3 text-sm 
                       text-gray-500 hover:border-primary hover:text-primary 
                       transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add New Address
          </button>
        </div>
      </div>
    </div>
  );
}
