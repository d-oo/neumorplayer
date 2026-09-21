import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVideoSlot } from "@/features/player/hooks/useVideoSlot";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/shared/lib/supabase";
import { tracksQueryKey, type Track } from "../lib/tracks";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { formatDuration } from "@/shared/lib/format-time";
import AddToPlaylistButton from "@/features/player/components/AddToPlaylistButton";
import { PlayIcon } from "@/shared/components/icons";
import PillButton from "@/shared/components/PillButton";

async function fetchTrack(id: string): Promise<Track> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// old-src/src/components/MusicInfo.js 를 대체할 자리.
// TODO: 제목/아티스트/태그 수정 폼(react-hook-form + zod 추천)은 아직 없고,
// 조회 + 재생 + 삭제까지만 구현했습니다.
//
// 아래 div는 HomeLayout에 항상 마운트되어 있는 YouTubePlayer가 포탈링해 들어오는
// 자리입니다(이 페이지를 벗어나면 다시 화면 밖 오프스크린 컨테이너로 돌아가 배경
// 재생을 유지합니다) — useVideoSlot 자체를 지우지 마세요.
export default function MusicInfoPage() {
  const { musicId } = useParams<{ musicId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSlotEl } = useVideoSlot();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const playQueue = usePlayerStore((s) => s.playQueue);

  useEffect(() => {
    setSlotEl(containerRef.current);
    return () => setSlotEl(null);
  }, [setSlotEl]);

  const {
    data: track,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["track", musicId],
    queryFn: () => fetchTrack(musicId!),
    enabled: !!musicId,
  });

  useDocumentTitle(track ? track.title : "NeumorPlayer");

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!musicId) return;
      const { error } = await supabase.from("tracks").delete().eq("id", musicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tracksQueryKey(user?.id) });
      navigate("/");
    },
  });

  return (
    <div>
      <h2>음악 정보</h2>
      {isLoading && <p>불러오는 중...</p>}
      {isError && <p>곡 정보를 불러오지 못했습니다.</p>}
      {track && (
        <div className="mt-2">
          <p className="text-lg font-semibold text-neu-ink">{track.title}</p>
          <p className="text-sm text-neu-muted">{track.artist.join(", ")}</p>
          <p className="mt-1 text-xs text-neu-muted">
            {track.tags.map((tag) => `#${tag}`).join("  ")}
            {track.tags.length > 0 && "  ·  "}
            {formatDuration(track.duration)} · {track.play_count.toLocaleString()}회 재생
          </p>
          <div className="mt-3 flex gap-2.5">
            <PillButton
              onClick={() => playQueue([track], 0)}
              icon={<PlayIcon className="ml-0.5" />}
            >
              재생
            </PillButton>
            <AddToPlaylistButton track={track} variant="pill" />
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="rounded-full border border-white/85 px-4 py-2 text-sm font-semibold text-neu-muted hover:text-neu-ink"
            >
              {deleteMutation.isPending ? "삭제 중..." : "삭제"}
            </button>
          </div>
          {deleteMutation.isError && (
            <p className="mt-2 text-xs text-red-500">삭제에 실패했습니다.</p>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        className="mt-4 aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-black"
      />
    </div>
  );
}
