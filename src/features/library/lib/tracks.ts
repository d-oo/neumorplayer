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

// 트랙 단건(MusicInfoPage) 조회 키. YouTubePlayer가 재생 횟수를 올린 뒤 같은 키로
// 무효화하므로 두 곳이 반드시 같은 모양이어야 합니다 — tracksQueryKey와 달리 여기에
// userId를 끼워 넣지 마세요(넣으면 무효화가 에러 없이 빗나갑니다).
export function trackQueryKey(trackId: string | undefined) {
  return ["track", trackId] as const;
}

export async function fetchLibraryTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchTrack(id: string): Promise<Track> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTrack(id: string): Promise<void> {
  const { error } = await supabase.from("tracks").delete().eq("id", id);
  if (error) throw error;
}

// 라이브러리에서 실제로 쓰인 태그를 곡수 내림차순으로 셉니다. 탐색 화면의 태그 제안
// (useTagSelection)과 헤더 검색 결과의 태그 카드(SearchResultsView)가 같은 집계를
// 각자 구현하고 있어서 여기로 모았습니다 — 상위 N개만 쓸지는 호출부가 정합니다.
export function countTagUsage(tracks: Track[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  tracks.forEach((t) =>
    t.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  );
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
