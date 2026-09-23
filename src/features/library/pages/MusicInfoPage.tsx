import { useEffect, useRef, useState } from "react";
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
import ConfirmModal from "@/shared/components/ConfirmModal";
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
// 비디오 영역은 이 트랙이 지금 재생 중이 아니면 TrackThumbnail을 보여주고, 재생
// 중이면 이 박스를 "앵커"로 등록합니다(useVideoSlot) — 그러면 HomeLayout에 항상
// 마운트되어 있는 YouTubePlayer의 실제 iframe 박스가 화면 우측 하단 미니 플레이어
// 위치에서 이 박스의 좌표로 애니메이션 이동해 와서 바로 위에 겹쳐집니다(재생 중엔
// 박스를 비워둡니다 — 유튜브 썸네일이 잠깐 보였다가 실제 영상으로 스왑되면 어색해서).
// 이 페이지를 벗어나면 다시 우측 하단으로 미끄러져 돌아가고(iframe 자체는 한 번도
// 제거되지 않으므로 재생이 끊기지 않습니다 — useVideoSlot 자체를 지우지 마세요).
export default function MusicInfoPage() {
  const { musicId } = useParams<{ musicId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { setAnchorEl } = useVideoSlot();
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
  // 자리를 앵커로 등록해 실제 유튜브 iframe을 이 위치로 끌어옵니다 — 그렇지
  // 않으면(다른 곡이 재생 중이거나 아무것도 재생 중이 아니면) 앵커를 등록하지
  // 않고, 여기는 TrackThumbnail만 보여줍니다.
  const isThisTrackPlaying =
    !!track && currentIndex >= 0 && queue[currentIndex]?.id === track.id;

  useEffect(() => {
    if (!isThisTrackPlaying) return;
    setAnchorEl(containerRef.current);
    return () => setAnchorEl(null);
  }, [isThisTrackPlaying, setAnchorEl]);

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
          ref={containerRef}
          className="h-51.75 w-92 flex-none overflow-hidden rounded-[14px] border border-(--neu-border-80)"
          style={{ boxShadow: "var(--neu-shadow-media-card)" }}
        >
          {/* 재생 중일 때는 썸네일을 안 그립니다 — 실제 iframe이 도킹돼 겹쳐지기
              전까지 유튜브 썸네일이 잠깐 보였다가 실제 영상으로 스왑되는 게 어색해서,
              빈 박스로 두고 iframe이 미끄러져 들어오는 것만 보이게 합니다. */}
          {!isThisTrackPlaying && (
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
            <AddToPlaylistButton track={track} />
            <IconCircleButton
              size="xl"
              tooltip={
                isThisTrackPlaying
                  ? "재생 중인 곡은 수정할 수 없습니다"
                  : "수정"
              }
              disabled={isThisTrackPlaying}
              aria-label="수정"
              className={`${secondaryCircleButtonClass} text-(--neu-ink-34) enabled:hover:text-neu-hi`}
            >
              <PencilIcon />
            </IconCircleButton>
            <IconCircleButton
              size="xl"
              tooltip={
                isThisTrackPlaying
                  ? "재생 중인 곡은 삭제할 수 없습니다"
                  : "삭제"
              }
              onClick={() => setConfirmingDelete(true)}
              disabled={deleteMutation.isPending || isThisTrackPlaying}
              aria-label="삭제"
              className={`${secondaryCircleButtonClass} text-(--neu-ink-34) enabled:hover:text-(--neu-danger)`}
            >
              <TrashIcon />
            </IconCircleButton>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmingDelete}
        onClose={() => {
          setConfirmingDelete(false);
          deleteMutation.reset();
        }}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
        errorMessage={deleteMutation.isError ? "삭제에 실패했습니다." : null}
        title="정말 삭제하시겠어요?"
        description={`"${track.title}"이(가) 라이브러리와 모든 재생목록에서 삭제되며 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
      />
    </div>
  );
}
