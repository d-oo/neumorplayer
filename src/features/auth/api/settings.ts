import { supabase } from "@/shared/lib/supabase";
import type { Theme } from "@/shared/lib/theme";

export function themeQueryKey(userId: string | undefined) {
  return ["user-settings", "theme", userId] as const;
}

// 아직 테마를 한 번도 바꾼 적 없는 사용자는 user_settings에 row가 없을 수 있어서
// (첫 쓰기 전까지 upsert된 적이 없음) maybeSingle로 조회하고 없으면 기본값(라이트)을
// 돌려줍니다 — RLS 때문에 0건이 반환되는 것과는 다른, 정상적인 "아직 설정 안 함" 상태입니다.
export async function fetchThemeSetting(userId: string): Promise<Theme> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("theme")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.theme as Theme | undefined) ?? "light";
}

export async function updateThemeSetting(
  userId: string,
  theme: Theme,
): Promise<void> {
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, theme });
  if (error) throw error;
}
