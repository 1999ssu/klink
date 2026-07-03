// src/components/admin/products/form-sections/ImageSection.tsx
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";

interface Props {
  existingImage: string;
  newImagePreview: string | null;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveExisting: () => void;
  onRemoveNew: () => void;
}

export default function ImageSection({
  existingImage,
  newImagePreview,
  onImageSelect,
  onRemoveExisting,
  onRemoveNew,
}: Props) {
  const hasImage = existingImage || newImagePreview;

  return (
    <div className="bg-white border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Product Image
      </h2>
      <p className="text-xs text-gray-400">
        ※ 크롤링 시 대표 이미지 1장이 자동으로 추가됩니다. 직접 업로드도
        가능합니다.
      </p>

      <div className="flex gap-3">
        {/* 기존 이미지 (크롤링 or Firebase) */}
        {existingImage && (
          <div className="relative w-24 h-32 bg-gray-100 group flex-shrink-0">
            <Image
              src={existingImage}
              alt="product"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={onRemoveExisting}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 
                         opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}

        {/* 새 이미지 미리보기 */}
        {newImagePreview && (
          <div className="relative w-24 h-32 bg-gray-100 group flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={newImagePreview}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={onRemoveNew}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 
                         opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}

        {/* 업로드 버튼 — 이미지 없을 때만 */}
        {!hasImage && (
          <label
            className="w-24 h-32 border-2 border-dashed border-gray-300 
                            flex flex-col items-center justify-center gap-2 
                            cursor-pointer hover:border-primary hover:text-primary 
                            transition-colors text-gray-400"
          >
            <Upload size={20} />
            <span className="text-xs">Add Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageSelect}
            />
          </label>
        )}
      </div>
    </div>
  );
}
