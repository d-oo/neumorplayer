import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchLibraryTracks, tracksQueryKey } from "../lib/tracks";

// 로그인한 사용자의 라이브러리 곡 목록(추가순) 쿼리. 라이브러리 화면(LibraryPage),
// 헤더 검색 결과(SearchResultsView), 탐색 화면의 태그 제안(ExplorePage)이 같은 쿼리를
// 씁니다.
export function useLibraryTracks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: tracksQueryKey(user?.id),
    queryFn: fetchLibraryTracks,
    enabled: !!user,
  });
}
