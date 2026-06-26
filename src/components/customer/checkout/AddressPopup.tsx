// src/components/customer/checkout/AddressPopup.tsx
"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Address } from "@/types";
import { useAddress } from "@/hooks/useAddress";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries: ["places"] = ["places"];

const addressSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  province: z.string().min(1, "Required"),
  postalCode: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"), // default 제거
  isDefault: z.boolean(), // default 제거
});

type AddressForm = z.infer<typeof addressSchema>;

interface Props {
  onClose: () => void;
  onSaved: (address: Address) => void;
}

export default function AddressPopup({ onClose, onSaved }: Props) {
  const { addAddress, loading } = useAddress();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      // ← 여기서 기본값 설정
      country: "Canada",
      isDefault: false,
    },
  });
  // 구글 Places에서 주소 선택 시 자동 입력
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.address_components) return;

    const get = (type: string) =>
      place.address_components!.find((c) => c.types.includes(type))
        ?.long_name ?? "";

    const streetNumber = get("street_number");
    const route = get("route");
    setValue("street", `${streetNumber} ${route}`.trim());
    setValue("city", get("locality") || get("sublocality"));
    setValue("province", get("administrative_area_level_1"));
    setValue("postalCode", get("postal_code"));
    setValue("country", get("country") || "Canada");
  };

  const onSubmit = async (data: AddressForm) => {
    const saved = await addAddress(data);
    if (saved) onSaved(saved);
    onClose();
  };

  return (
    // 오버레이
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Add New Address
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* 이름 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                {...register("firstName")}
                className="input-base"
                placeholder="John"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                {...register("lastName")}
                className="input-base"
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              {...register("phone")}
              className="input-base"
              placeholder="+1 416 000 0000"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* 주소 검색 (Google Places) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search Address
            </label>
            {isLoaded ? (
              <Autocomplete
                onLoad={(ac) => {
                  autocompleteRef.current = ac;
                }}
                onPlaceChanged={handlePlaceSelect}
                options={{ componentRestrictions: { country: "ca" } }} // 캐나다만
              >
                <input
                  type="text"
                  className="input-base"
                  placeholder="Start typing your address..."
                />
              </Autocomplete>
            ) : (
              <input className="input-base" placeholder="Loading..." disabled />
            )}
          </div>

          {/* 자동완성 결과 필드들 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              {...register("street")}
              className="input-base"
              placeholder="123 Main St"
            />
            {errors.street && (
              <p className="text-xs text-red-500 mt-1">
                {errors.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                {...register("city")}
                className="input-base"
                placeholder="Toronto"
              />
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Province
              </label>
              <input
                {...register("province")}
                className="input-base"
                placeholder="Ontario"
              />
              {errors.province && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.province.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                {...register("postalCode")}
                className="input-base"
                placeholder="M5V 2T6"
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.postalCode.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                {...register("country")}
                className="input-base"
                defaultValue="Canada"
                readOnly
              />
            </div>
          </div>

          {/* 기본 주소 설정 */}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              {...register("isDefault")}
              type="checkbox"
              className="accent-primary"
            />
            Set as default shipping address
          </label>

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? "Saving..." : "Add Address"}
          </button>
        </form>
      </div>
    </div>
  );
}
