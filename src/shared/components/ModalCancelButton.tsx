import type { ButtonHTMLAttributes } from "react";
import { secondaryPillButtonClass } from "@/shared/styles/secondary-button-class";

// 모달 하단의 "취소" 버튼(확인 모달, 설정의 탈퇴 확인, "재생목록에 추가" 모달 두 개).
// 처리 중에 막아야 하는 곳은 disabled를 넘기면 흐리게 바뀝니다 — disabled를 쓰지 않는
// 곳에선 disabled: 클래스가 아무 효과도 없습니다.
export default function ModalCancelButton(
  props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">,
) {
  return (
    <button
      type="button"
      className={`px-4.5 py-2.25 text-[13px] text-(--neu-ink-40) hover:text-(--neu-ink-24) disabled:cursor-default disabled:opacity-60 ${secondaryPillButtonClass}`}
      {...props}
    >
      취소
    </button>
  );
}
