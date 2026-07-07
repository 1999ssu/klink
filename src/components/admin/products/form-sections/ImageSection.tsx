// src/components/admin/products/form-sections/ImageSection.tsx
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";

interface Props {
  existingImages: string[];
  newImagePreviews: string[];
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (index: number) => void;
}

export default function ImageSection({
  existingImages,
  newImagePreviews,
  onImageSelect,
  onRemoveExisting,
  onRemoveNew,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Product Images
      </h2>

      <div className="grid grid-cols-4 gap-3">
        {/* 기존 이미지들 */}
        {existingImages.map((url, i) => (
          <div key={url} className="relative aspect-[3/4] bg-gray-100 group">
            <Image src={url} alt="product" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(url)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 
                         opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={11} />
            </button>
            {/* 첫 번째 이미지 대표 표시 */}
            {i === 0 && (
              <span
                className="absolute bottom-1 left-1 bg-black/60 
                               text-white text-[10px] px-1.5 py-0.5"
              >
                Main
              </span>
            )}
          </div>
        ))}

        {/* 새 이미지 미리보기들 */}
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
              onClick={() => onRemoveNew(i)}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 
                         opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={11} />
            </button>
            {/* 기존 이미지 없을 때 첫 번째 새 이미지가 대표 */}
            {existingImages.length === 0 && i === 0 && (
              <span
                className="absolute bottom-1 left-1 bg-black/60 
                               text-white text-[10px] px-1.5 py-0.5"
              >
                Main
              </span>
            )}
          </div>
        ))}

        {/* 업로드 버튼 — 항상 표시 */}
        <label
          className="aspect-[3/4] border-2 border-dashed border-gray-300 
                          flex flex-col items-center justify-center gap-2 
                          cursor-pointer hover:border-primary hover:text-primary 
                          transition-colors text-gray-400"
        >
          <Upload size={20} />
          <span className="text-xs text-center">Add Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onImageSelect}
          />
        </label>
      </div>

      {/* 이미지 수 표시 */}
      {existingImages.length + newImagePreviews.length > 0 && (
        <p className="text-xs text-gray-400">
          총 {existingImages.length + newImagePreviews.length}장
          {existingImages.length + newImagePreviews.length >= 2 &&
            " · 첫 번째 이미지가 대표 이미지로 사용됩니다"}
        </p>
      )}
    </div>
  );
}
