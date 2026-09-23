import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { fetchThemeSetting, themeQueryKey } from "../api/settings";
import { useThemeStore } from "@/shared/lib/theme";

// HomeLayout(인증된 영역의 셸)에서만 호출합니다. 로그인한 사용자의 user_settings.theme을
// 가져와 화면에 적용하고, 이 훅이 마운트 해제되면(로그아웃, 또는 비로그인 전용 화면으로
// 이동) 라이트로 되돌립니다 — 로그인/회원가입/랜딩 페이지는 이 훅을 아예 호출하지 않으므로
// 항상 라이트를 씁니다. Supabase 조회가 끝나기 전(첫 로드 직후)엔 잠깐 라이트로 보이다
// 실제 값으로 바뀔 수 있습니다 — localStorage 캐시 없이 서버 값만 신뢰하기로 한 절충입니다.
export function useThemeSync() {
  const { user } = useAuth();
  const setTheme = useThemeStore((s) => s.setTheme);

  const { data: theme } = useQuery({
    queryKey: themeQueryKey(user?.id),
    queryFn: () => fetchThemeSetting(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (theme) setTheme(theme);
  }, [theme, setTheme]);

  useEffect(() => {
    return () => setTheme("light");
  }, [setTheme]);
}
