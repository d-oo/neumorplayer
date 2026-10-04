import type { InputHTMLAttributes, ReactNode } from "react";
import SearchFieldInput from "@/shared/components/SearchFieldInput";
import { fieldBoxStyle } from "@/shared/styles/field-box-style";

// 탐색 화면 입력칸/영역 위의 작은 라벨("제목", "아티스트", "태그", "검색 결과" 등).
// 아래 여백은 자리마다 달라서 className으로 받습니다.
export function FieldLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[11.5px] font-bold tracking-[0.06em] text-neu-muted ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

// 탐색 화면의 라벨 + 검색 입력칸(제목, 아티스트, 비디오 ID). 입력 관련 props는
// SearchFieldInput에 그대로 넘깁니다.
export default function LabeledSearchField({
  label,
  ...inputProps
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <FieldLabel className="mb-2.25">{label}</FieldLabel>
      <div
        className="flex items-center rounded-[11px] border border-(--neu-border-80) px-3.5 py-2.5"
        style={fieldBoxStyle}
      >
        <SearchFieldInput {...inputProps} lineHeightPx={20.25} />
      </div>
    </div>
  );
}
