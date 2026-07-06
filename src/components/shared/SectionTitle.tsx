// src/components/shared/SectionTitle.tsx
// admin 페이지들에서 반복되는 섹션 제목 패턴

interface Props {
  children: React.ReactNode;
}

export default function SectionTitle({ children }: Props) {
  return (
    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
      {children}
    </h2>
  );
}
