import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVideoSlot } from "@/features/player/hooks/useVideoSlot";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  deleteTrack,
  fetchTrack,
  trackQueryKey,
  tracksQueryKey,
} from "../lib/tracks";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { formatDuration } from "@/shared/lib/format-time";
import { secondaryCircleButtonClass } from "@/shared/styles/secondary-button-class";
import AddToPlaylistButton from "@/features/player/components/AddToPlaylistButton";
import PlayPauseButton from "@/features/player/components/PlayPauseButton";
import IconCircleButton from "@/shared/components/IconCircleButton";
import MutedNote from "@/shared/components/MutedNote";
import TrackThumbnail from "@/shared/components/TrackThumbnail";
import { PencilIcon, TrashIcon } from "@/shared/components/icons";
import MarqueeText from "@/features/player/components/MarqueeText";

const statBoxStyle = {
  background: "var(--neu-surface)",
  boxShadow: "var(--neu-shadow-stat-box)",
};

// old-src/src/components/MusicInfo.js 를 대체합니다. docs/design/수정본2.zip
// (1b-B 트랙 상세)의 레이아웃을 그대로 옮겼습니다.
// TODO: 제목/아티스트/태그 수정 폼(react-hook-form + zod 추천)은 아직 없고, "수정"
// 버튼은 자리만 있습니다(docs/todos.md 참고).
//
// 비디오 영역은 이 트랙이 실제로 재생 중(또는 일시정지 상태로 로드됨)일 때만
// HomeLayout에 항상 마운트되어 있는 YouTubePlayer가 포탈링해 들어오고(이 페이지를
// 벗어나거나 다른 곡이 재생되면 다시 화면 밖 오프스크린 컨테이너로 돌아가 배경
// 재생을 유지합니다 — useVideoSlot 자체를 지우지 마세요), 그 외에는 TrackThumbnail로
// 대체합니다(다른 곡이 재생 중일 때 이 페이지에 그 영상이 잘못 나타나거나, 빈 검은
// 사각형만 보이는 걸 막기 위함). 시안의 재생 버튼 오버레이는 실제 iframe이 있을 땐
// iframe 자체가 이미 클릭 가능한 컨트롤을 가져서 넣지 않았습니다.
export default function MusicInfoPage() {
  const { musicId } = useParams<{ musicId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSlotEl } = useVideoSlot();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const playQueue = usePlayerStore((s) => s.playQueue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const queue = usePlayerStore((s) => s.queue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  const {
    data: track,
    isLoading,
    isError,
  } = useQuery({
    queryKey: trackQueryKey(musicId),
    queryFn: () => fetchTrack(musicId!),
    enabled: !!musicId,
  });

  useDocumentTitle(track ? track.title : "NeumorPlayer");

  // 이 트랙이 지금 큐에서 재생 중인(또는 일시정지된) 바로 그 트랙일 때만 이
  // 자리에 실제 유튜브 iframe을 붙입니다 — 그렇지 않으면(다른 곡이 재생 중이거나
  // 아무것도 재생 중이 아니면) YouTubePlayer는 화면 밖 오프스크린 컨테이너에
  // 남아있고, 여기는 아래에서 트랙 썸네일을 대신 보여줍니다.
  const isThisTrackPlaying =
    !!track && currentIndex >= 0 && queue[currentIndex]?.id === track.id;

  useEffect(() => {
    if (!isThisTrackPlaying) return;
    setSlotEl(containerRef.current);
    return () => setSlotEl(null);
  }, [isThisTrackPlaying, setSlotEl]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!musicId) return;
      await deleteTrack(musicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tracksQueryKey(user?.id) });
      navigate("/");
    },
  });

  function handlePlayClick() {
    if (!track) return;
    if (isThisTrackPlaying) setIsPlaying(!isPlaying);
    else playQueue([track], 0);
  }

  if (isLoading) {
    return <MutedNote>불러오는 중...</MutedNote>;
  }
  if (isError || !track) {
    return <MutedNote>곡 정보를 불러오지 못했습니다.</MutedNote>;
  }

  return (
    <div>
      <p className="text-[11.5px] font-bold tracking-[0.08em] text-neu-hi">
        트랙
      </p>
      <h1 className="mt-2.5 mb-3 text-[40px] leading-[1.05] font-extrabold tracking-[-0.045em] text-neu-ink">
        <MarqueeText text={track.title} />
      </h1>
      <p className="text-[13px] text-neu-muted">{track.artist.join(", ")}</p>

      {track.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {track.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-(--neu-border-70) bg-neu-accent-tint px-3.25 py-1.75 text-xs font-semibold text-neu-hi shadow-neu-tag-chip"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="my-6.5 h-px bg-neu-divider" />

      <div className="flex items-start gap-6.5">
        <div
          className="h-51.75 w-92 flex-none overflow-hidden rounded-[14px] border border-(--neu-border-80)"
          style={{ boxShadow: "var(--neu-shadow-media-card)" }}
        >
          {isThisTrackPlaying ? (
            <div ref={containerRef} className="h-full w-full bg-black" />
          ) : (
            <TrackThumbnail
              videoId={track.video_id}
              quality="high"
              className="h-full w-full"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <div className="flex gap-2.5 self-stretch">
            <div className="min-w-0 flex-1 rounded-[11px] px-3.25 py-2.25" style={statBoxStyle}>
              <p className="text-[9.5px] font-bold tracking-[0.08em] text-neu-muted">
                재생 횟수
              </p>
              <p className="mt-0.75 font-neu-mono text-sm font-medium text-neu-ink">
                {track.play_count.toLocaleString()}
              </p>
            </div>
            <div className="min-w-0 flex-1 rounded-[11px] px-3.25 py-2.25" style={statBoxStyle}>
              <p className="text-[9.5px] font-bold tracking-[0.08em] text-neu-muted">
                재생 시간
              </p>
              <p className="mt-0.75 font-neu-mono text-sm font-medium text-neu-ink">
                {formatDuration(track.duration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PlayPauseButton
              playing={isThisTrackPlaying && isPlaying}
              onClick={handlePlayClick}
            />
            <AddToPlaylistButton track={track} size="xl" />
            <IconCircleButton
              size="xl"
              tooltip="수정"
              aria-label="수정"
              className={`${secondaryCircleButtonClass} text-(--neu-ink-34) hover:text-neu-hi`}
            >
              <PencilIcon />
            </IconCircleButton>
            <IconCircleButton
              size="xl"
              tooltip="삭제"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              aria-label="삭제"
              className={`${secondaryCircleButtonClass} text-(--neu-ink-34) hover:text-(--neu-danger)`}
            >
              <TrashIcon />
            </IconCircleButton>
          </div>
          {deleteMutation.isError && (
            <p className="text-xs text-red-500">삭제에 실패했습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
