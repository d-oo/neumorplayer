import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/database.types";

export type Track = Database["public"]["Tables"]["tracks"]["Row"];

// SearchPage(라이브러리)와 SearchResultsView(헤더 검색)가 같은 사용자 트랙 목록을
// 공유해서 쓰므로 여기 한 곳에 모아둡니다. RLS가 이미 auth.uid() = user_id로 행을
// 제한하므로 .eq("user_id", ...) 필터는 따로 붙이지 않습니다 — user?.id는 쿼리 키를
// 로그아웃/재로그인 시 캐시가 섞이지 않게 구분하는 용도로만 씁니다.
export function tracksQueryKey(userId: string | undefined) {
  return ["tracks", userId] as const;
}

export async function fetchLibraryTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
