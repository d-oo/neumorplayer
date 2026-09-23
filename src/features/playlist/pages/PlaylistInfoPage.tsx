import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlayerStore } from "@/features/player/lib/usePlayerStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  deletePlaylist,
  fetchPlaylist,
  fetchPlaylistTracks,
  playlistQueryKey,
  playlistTracksQueryKey,
  playlistsQueryKey,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
} from "../lib/playlists";
import type { Track } from "@/features/library/lib/tracks";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { formatDuration } from "@/shared/lib/format-time";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import {
  DragHandleIcon,
  PencilIcon,
  ShuffleIcon,
  TrashIcon,
  XIcon,
} from "@/shared/components/icons";
import { secondaryCircleButtonClass } from "@/shared/styles/secondary-button-class";
import PlaylistCoverGrid from "@/features/player/components/PlaylistCoverGrid";
import PlayPauseButton from "@/features/player/components/PlayPauseButton";
import MarqueeText from "@/features/player/components/MarqueeText";
import TrackRowInfo from "@/features/library/components/TrackRowInfo";
import IconCircleButton from "@/shared/components/IconCircleButton";
import MutedNote from "@/shared/components/MutedNote";

// 드래그 손잡이/번호/썸네일은 한 그리드 컬럼(트랙 정보) 안에 flex로 넣어서 그
// 사이 간격만 gap-4(16px)보다 좁은 gap-2(8px)를 따로 줍니다 — CSS grid의 gap은
// 모든 컬럼 사이에 균일하게 적용되어 특정 구간만 좁힐 수 없기 때문입니다.
const trackRowGridColumns = "minmax(0,1fr) 110px 74px 62px 28px";
// "지금 재생 중" 번호 칸의 막대 이퀄라이저 — 시안 그대로 막대마다 주기와 시작
// 지연이 달라서 서로 어긋나게 흔들립니다(@keyframes neu-eq, src/index.css).
const EQ_BAR_ANIMATIONS = [
  "neu-eq 0.72s ease-in-out infinite alternate",
  "neu-eq 0.55s ease-in-out 0.1s infinite alternate",
  "neu-eq 0.86s ease-in-out 0.22s infinite alternate",
];

// dnd-kit 순서 변경 + 목록 제거 버튼을 위해 각 행을 별도 컴포넌트로 뽑았습니다.
// 드래그는 왼쪽 그립 아이콘(useSortable의 listeners)에만 걸려 있어서, 행 자체를
// 클릭하는 "재생" 동작과 서로 간섭하지 않습니다.
function SortableTrackRow({
  track,
  index,
  isCurrentTrack,
  onPlay,
  onRemove,
  isRemoving,
}: {
  track: Track;
  index: number;
  isCurrentTrack: boolean;
  onPlay: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        gridTemplateColumns: trackRowGridColumns,
        ...currentTrackRowStyle(isCurrentTrack),
      }}
      className="grid items-center gap-4 rounded-[11px] px-3.5 py-2.25 hover:bg-neu-row-hover"
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="순서 변경"
          className="w-5.5 flex-none touch-none text-(--neu-ink-60) hover:text-neu-hi"
        >
          <DragHandleIcon />
        </button>
        <div
          onClick={onPlay}
          className="w-8.5 flex-none cursor-pointer font-neu-mono text-[12.5px]"
          style={{
            color: isCurrentTrack ? "var(--neu-hi)" : "var(--neu-muted)",
          }}
        >
          {isCurrentTrack ? (
            <div className="flex h-3.5 items-end gap-0.5">
              {EQ_BAR_ANIMATIONS.map((animation) => (
                <span
                  key={animation}
                  className="w-0.75 rounded-xs bg-neu-accent-light"
                  style={{ animation }}
                />
              ))}
            </div>
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </div>
        <div
          onClick={onPlay}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
        >
          <TrackRowInfo track={track} isCurrentTrack={isCurrentTrack} />
        </div>
      </div>
      <MarqueeText
        text={track.tags.map((tag) => `#${tag}`).join("  ")}
        className="text-xs text-neu-muted"
      />
      <div className="text-right font-neu-mono text-[12.5px] text-neu-muted">
        {track.play_count.toLocaleString()}
      </div>
      <div className="text-right font-neu-mono text-[12.5px] text-neu-muted">
        {formatDuration(track.duration)}
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`${track.title} 재생목록에서 제거`}
        className="grid h-6 w-6 place-items-center justify-self-end rounded-full text-(--neu-ink-55) hover:text-red-500 disabled:opacity-40"
      >
        <XIcon />
      </button>
    </div>
  );
}

// old-src/src/components/PlaylistInfo.js 를 대체합니다. docs/design/ 시안(1b-A)의
// 색상·그림자·치수는 그대로 두고, playlists/playlist_tracks 조회·트랙 추가는
// AddToPlaylistButton(MusicInfoPage/PlayerPanel)에서 처리하므로 여기서는 조회 +
// 삭제 + 제거 + dnd-kit 순서 변경만 담당합니다.
export default function PlaylistInfoPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playingPlaylistId = usePlayerStore((s) => s.playingPlaylistId);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const {
    data: playlist,
    isLoading: isPlaylistLoading,
    isError: isPlaylistError,
  } = useQuery({
    queryKey: playlistQueryKey(playlistId),
    queryFn: () => fetchPlaylist(playlistId!),
    enabled: !!playlistId,
  });

  const { data: tracks = [], isLoading: isTracksLoading } = useQuery({
    queryKey: playlistTracksQueryKey(playlistId),
    queryFn: () => fetchPlaylistTracks(playlistId!),
    enabled: !!playlistId,
  });

  useDocumentTitle(playlist ? `재생목록 - ${playlist.title}` : "NeumorPlayer");

  const totalSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);
  const isThisPlaylistPlaying =
    playlistId !== undefined && playingPlaylistId === playlistId;
  const currentTrackId =
    isThisPlaylistPlaying && currentIndex >= 0
      ? queue[currentIndex]?.id
      : undefined;

  const deletePlaylistMutation = useMutation({
    mutationFn: () => deletePlaylist(playlistId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey(user?.id) });
      navigate("/");
    },
  });

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) =>
      removeTrackFromPlaylist(playlistId!, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: playlistTracksQueryKey(playlistId),
      });
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey(user?.id) });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedTrackIds: string[]) =>
      reorderPlaylistTracks(playlistId!, orderedTrackIds),
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: playlistTracksQueryKey(playlistId),
      });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !playlistId) return;
    const oldIndex = tracks.findIndex((t) => t.id === active.id);
    const newIndex = tracks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(tracks, oldIndex, newIndex);
    queryClient.setQueryData(playlistTracksQueryKey(playlistId), reordered);
    reorderMutation.mutate(reordered.map((t) => t.id));
  }

  function handlePlayClick() {
    if (isThisPlaylistPlaying) setIsPlaying(!isPlaying);
    else if (playlistId) playQueue(tracks, 0, playlistId);
  }

  function handleShuffleClick() {
    if (!isThisPlaylistPlaying && playlistId) playQueue(tracks, 0, playlistId);
    toggleShuffle();
  }

  if (isPlaylistLoading || isTracksLoading) {
    return <MutedNote>불러오는 중...</MutedNote>;
  }
  if (isPlaylistError || !playlist) {
    return <MutedNote>재생목록을 찾을 수 없습니다.</MutedNote>;
  }

  return (
    <div>
      <div className="flex items-end gap-5.5">
        <div
          className="h-34.75 w-62 flex-none overflow-hidden rounded-xl border border-(--neu-border-80)"
          style={{ boxShadow: "var(--neu-shadow-media-card)" }}
        >
          <PlaylistCoverGrid
            videoIds={tracks.slice(0, 4).map((t) => t.video_id)}
            className="h-full w-full"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-bold tracking-[0.08em] text-neu-hi">
            재생목록
          </p>
          <h1 className="mt-2.5 mb-3 text-[44px] font-extrabold leading-[1.04] tracking-[-0.045em] text-neu-ink">
            <MarqueeText text={playlist.title} />
          </h1>
          <p className="text-[13px] text-neu-muted">
            {tracks.length}곡 · {Math.floor(totalSeconds / 60)}분{" "}
            {totalSeconds % 60}초
          </p>

          <div className="mt-4.5 flex items-center gap-3">
            <PlayPauseButton
              playing={isThisPlaylistPlaying && isPlaying}
              onClick={handlePlayClick}
              disabled={tracks.length === 0}
              playLabel="전체 재생"
            />
            <IconCircleButton
              size="xl"
              tooltip="셔플"
              onClick={handleShuffleClick}
              disabled={tracks.length === 0}
              aria-label="셔플"
              className={`${secondaryCircleButtonClass} text-(--neu-ink-34) hover:text-neu-hi`}
            >
              <ShuffleIcon />
            </IconCircleButton>

            <div className="h-6 w-px bg-neu-divider" />

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
              onClick={() => deletePlaylistMutation.mutate()}
              disabled={deletePlaylistMutation.isPending}
              aria-label="재생목록 삭제"
              className={`${secondaryCircleButtonClass} text-(--neu-ink-34) hover:text-(--neu-danger)`}
            >
              <TrashIcon />
            </IconCircleButton>
          </div>
        </div>
      </div>

      <div className="mt-6.5">
        <div
          className="grid gap-4 px-3.5 pb-2.5 text-[11px] font-bold tracking-wider text-neu-muted"
          style={{
            gridTemplateColumns: trackRowGridColumns,
            borderBottom: "1px solid var(--neu-divider)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5.5 flex-none" />
            <div className="w-8.5 flex-none">#</div>
            <div className="pl-18">제목</div>
          </div>
          <div>태그</div>
          <div className="text-right">재생 횟수</div>
          <div className="text-right">시간</div>
          <div />
        </div>

        {tracks.length === 0 ? (
          <MutedNote className="px-3.5 py-6">
            재생목록에 곡을 추가해주세요. 곡 상세 페이지 또는 재생 중인 곡
            카드의 "재생목록에 추가" 버튼으로 담을 수 있습니다.
          </MutedNote>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tracks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col pt-1.5">
                {tracks.map((track, index) => (
                  <SortableTrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    isCurrentTrack={track.id === currentTrackId}
                    isRemoving={
                      removeTrackMutation.isPending &&
                      removeTrackMutation.variables === track.id
                    }
                    onPlay={() =>
                      playlistId && playQueue(tracks, index, playlistId)
                    }
                    onRemove={() => removeTrackMutation.mutate(track.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
