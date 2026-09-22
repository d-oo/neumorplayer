import { useEffect, type RefObject } from "react";

// 드롭다운/팝오버가 열려 있는 동안 컨테이너 바깥을 클릭하면 닫아주는 훅.
// ProfileDropdown.tsx가 이 mousedown 리스너 방식을 처음 썼고(원래는
// AddToPlaylistButton.tsx의 드롭다운 버전에도 같은 코드가 있었는데, 그 컴포넌트가
// 모달로 바뀌며 사라졌습니다), 앞으로 같은 방식이 필요한 드롭다운이 늘어날 때 각자
// 손으로 리스너를 다시 짜지 않도록 여기로 뽑았습니다.
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    function onPointerDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onOutsideClick();
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [ref, onOutsideClick, enabled]);
}
