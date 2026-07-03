// src/components/shared/LoadingSpinner.tsx
// 여러 페이지에서 반복되던 로딩 스피너

interface Props {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  fullScreen = false,
}: Props) {
  const sizeClass = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
  }[size];

  const spinner = (
    <div
      className={`${sizeClass} border-primary border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        {spinner}
      </div>
    );
  }

  return spinner;
}
