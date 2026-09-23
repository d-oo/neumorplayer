import { create } from "zustand";
import { darkify } from "@/shared/lib/darkify";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

// 진짜 저장소는 Supabase user_settings.theme입니다(features/auth/api/settings.ts) —
// 여기 이 스토어는 로컬 캐시가 아니라 "지금 이 화면에 적용해야 할 테마"를 여러
// 컴포넌트가 리렌더 없이 구독할 수 있게 하는 순수 클라이언트 상태일 뿐입니다.
// localStorage에 persist하지 않습니다 — 로그인 안 한 화면(로그인/회원가입/랜딩)은
// 항상 라이트를 써야 하는데, 초기값이 곧 그 기본값(라이트)이고 features/auth/hooks/
// useThemeSync.ts가 인증 영역에 들어갔을 때만 실제 저장된 값으로 바꿔줍니다.
export const useThemeStore = create<ThemeState>()((set) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
  },
}));

// index.css의 --neu-* 토큰으로 표현되지 않은, 컴포넌트에 직접 박힌 라이트 모드 색/그림자
// 리터럴 문자열을 현재 테마에 맞게 바꿔줍니다. Tailwind 임의값 클래스나 shared/styles의
// 플레인 상수 객체처럼 훅을 호출할 수 없는 곳은 대신 index.css 토큰 + var()를 씁니다.
export function useThemed(lightValue: string): string {
  const theme = useThemeStore((s) => s.theme);
  return theme === "dark" ? darkify(lightValue) : lightValue;
}
