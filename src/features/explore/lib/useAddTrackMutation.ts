import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { tracksQueryKey } from "@/features/library/lib/tracks";
import { parseArtists, type ExploreResult } from "@/features/explore/api/search";

// "추가" 버튼이 쓰는 mutation. 선택한 영상의 video_id에 titleQuery/artistQuery(입력창에
// 남아있는 값)를 title/artist로 붙여 tracks 테이블에 insert합니다 — 유튜브 영상
// 제목/업로드 채널명이 아니라 사용자가 직접 입력한 값을 그대로 저장하므로, 업로드
// 채널명이 실제 아티스트와 다른 경우에도 사용자 의도대로 저장됩니다. video_id 기준
// unique 제약(user_id, video_id)이 있어 이미 추가한 곡은 DB가 막아주고, 그 에러를
// 사용자에게 그대로 보여줍니다.
export function useAddTrackMutation({
  userId,
  titleQuery,
  artistQuery,
  selected,
  selectedTags,
  onSuccess,
}: {
  userId: string | undefined;
  titleQuery: string;
  artistQuery: string;
  selected: ExploreResult | undefined;
  selectedTags: Set<string>;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selected || !userId) throw new Error("추가할 곡을 선택해주세요.");
      const { error } = await supabase.from("tracks").insert({
        user_id: userId,
        title: titleQuery.trim(),
        artist: parseArtists(artistQuery),
        video_id: selected.videoId,
        tags: Array.from(selectedTags),
        duration: selected.durationSec,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tracksQueryKey(userId) });
      onSuccess();
    },
  });

  // 중복 추가는 tracks의 (user_id, video_id) unique 제약(Postgres 코드 23505)이
  // 막아주므로, 에러 메시지만 사용자가 이해할 수 있는 문구로 바꿔줍니다.
  const errorMessage = mutation.isError
    ? (mutation.error as { code?: string } | null)?.code === "23505"
      ? "이미 라이브러리에 있는 곡입니다."
      : "추가에 실패했습니다. 다시 시도해주세요."
    : null;

  return { mutation, errorMessage };
}
