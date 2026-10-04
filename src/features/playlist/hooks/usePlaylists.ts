import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchPlaylists, playlistsQueryKey } from "../lib/playlists";

// 로그인한 사용자의 재생목록 목록(곡 수·커버 포함) 쿼리. 사이드바 "재생목록" 탭
// (dashboard의 QueueCard와 PlaylistNavList), 재생목록 추가 드롭다운
// (AddToPlaylistButton), 다른 재생목록에 추가 모달(AddTracksToPlaylistModal)이 같은
// 쿼리를 씁니다. enabled를 false로 주면 불러오지 않습니다 — 탭이나 모달이 열렸을
// 때만 불러오는 곳이 있어서입니다(이미 불러온 데이터는 캐시에서 그대로 돌려줌).
export function usePlaylists(enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: playlistsQueryKey(user?.id),
    queryFn: fetchPlaylists,
    enabled: !!user && enabled,
  });
}
