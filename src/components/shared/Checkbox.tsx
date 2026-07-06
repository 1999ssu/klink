// src/components/shared/Checkbox.tsx
// cart, wish 페이지에서 반복되는 체크박스 패턴

interface Props {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export default function Checkbox({ checked, onChange, className = "" }: Props) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`accent-primary flex-shrink-0 ${className}`}
    />
  );
}
