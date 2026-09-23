import type { ReactNode } from "react";

// 체크박스의 "네모 칸"만 담당합니다 — 회원가입 약관 동의(AuthForm)와 재생목록 추가
// 모달(AddToPlaylistButton)이 배경 그라디언트·그림자까지 똑같은 값을 각자 들고
// 있었습니다. 체크 표시는 두 화면이 서로 다른 아이콘(두께·크기가 다름)을 쓰고
// 있어서 합치지 않고 children으로 받습니다 — 하나로 통일하면 둘 중 한쪽 모양이
// 바뀌기 때문입니다.
//
// 루트가 <span>인 이유: AddToPlaylistButton 쪽은 이 칸이 <button> 안에 들어가서
// <div>를 쓰면 HTML 규칙 위반입니다(display는 grid 클래스가 정하므로 렌더 결과는
// 두 태그가 동일합니다).
export default function CheckBox({
  checked,
  className,
  children,
}: {
  checked: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`grid size-5 flex-none place-items-center rounded-md ${className ?? ""}`}
      style={{
        background: checked
          ? "linear-gradient(145deg, #8127b8, #5c1287)"
          : "var(--neu-surface-sunken)",
        boxShadow: checked
          ? "3px 3px 7px rgba(124,94,164,0.45), -2px -2px 6px rgba(255,255,255,0.9)"
          : "inset 3px 3px 6px rgba(150,136,175,0.5), inset -2px -2px 5px rgba(255,255,255,0.9)",
      }}
    >
      {checked ? children : null}
    </span>
  );
}
