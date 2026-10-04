import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import {
  selectCurrentTrack,
  usePlayerStore,
} from "@/features/player/lib/usePlayerStore";
import { playTrackAndOpenQueue } from "@/features/dashboard/lib/useQueueCardStore";
import {
  selectIsAudible,
  selectIsLoading,
} from "@/features/player/lib/playback-display";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  allPlaylistMembershipsQueryKey,
  deletePlaylist,
  fetchPlaylist,
  fetchPlaylistTracks,
  invalidatePlaylistMembership,
  playlistQueryKey,
  playlistTracksQueryKey,
  playlistsQueryKey,
  removeTracksFromPlaylist,
  reorderPlaylistTracks,
} from "../lib/playlists";
import { isTrackPlayable, type Track } from "@/features/library/lib/tracks";
import { useDocumentTitle } from "@/shared/lib/useDocumentTitle";
import { useToastStore } from "@/shared/lib/useToastStore";
import { toggleInSet } from "@/shared/lib/toggle-in-set";
import { currentTrackRowStyle } from "@/shared/styles/current-track-row-style";
import {
  CheckIcon,
  DragHandleIcon,
  PencilIcon,
  ShuffleIcon,
  TrashIcon,
} from "@/shared/components/icons";
import { secondaryCircleButtonClass } from "@/shared/styles/secondary-button-class";
import PlaylistCoverGrid from "../components/PlaylistCoverGrid";
import PlayPauseButton from "@/features/player/components/PlayPauseButton";
import MarqueeText from "@/shared/components/MarqueeText";
import DurationPlayButton from "@/features/player/components/DurationPlayButton";
import TrackRowInfo from "@/features/library/components/TrackRowInfo";
import AddTracksToPlaylistModal from "../components/AddTracksToPlaylistModal";
import SelectionActionBar from "../components/SelectionActionBar";
import CheckBox from "@/shared/components/CheckBox";
import ConfirmModal from "@/shared/components/ConfirmModal";
import IconCircleButton from "@/shared/components/IconCircleButton";
import MutedNote from "@/shared/components/MutedNote";

// 드래그 손잡이/번호/썸네일은 한 그리드 컬럼(트랙 정보) 안에 flex로 넣어서 그
// 사이 간격만 gap-4(16px)보다 좁은 gap-2(8px)를 따로 줍니다 — CSS grid의 gap은
// 모든 컬럼 사이에 균일하게 적용되어 특정 구간만 좁힐 수 없기 때문입니다.
const trackRowGridColumns = "minmax(0,1fr) 110px 74px 60px";

// 번호 칸 — 행 hover 또는 선택 상태에서는 같은 자리가 선택 체크박스로 바뀝니다.
// (지금 재생 중인 곡의 막대 이퀄라이저는 원래 여기 있었지만 재생시간 칸으로
// 옮겼습니다 — DurationPlayButton의 isCurrent 참고.) 글자와 체크박스를 한 grid 칸에 겹쳐 두고 opacity로만
// 바꿔서 칸 크기가 흔들리지 않게 합니다(Tab 포커스도 받을 수 있게 invisible 대신
// opacity — DurationPlayButton과 같은 이유).
//
// 칸 폭(w-8.5)은 바깥 div가 잡고, 실제로 눌리는 버튼은 체크박스 크기(size-5)로만
// 둡니다 — 칸 전체를 버튼으로 두면 체크박스 오른쪽 빈 공간까지 클릭돼 너무 넓었음.
// 번호 글자(세 자리면 20px보다 넓음)는 pointer-events-none이라 버튼 밖으로 삐져나온
// 부분을 눌러도 선택되지 않습니다.
function TrackSelectCell({
  index,
  isCurrentTrack,
  selected,
  onToggle,
  title,
}: {
  index: number;
  isCurrentTrack: boolean;
  selected: boolean;
  onToggle: () => void;
  title: string;
}) {
  return (
    <div
      className="w-8.5 flex-none font-neu-mono text-[12.5px]"
      style={{
        color: isCurrentTrack ? "var(--neu-hi)" : "var(--neu-muted)",
      }}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-label={`${title} 선택`}
        onClick={onToggle}
        className="grid size-5 cursor-pointer items-center justify-items-start"
      >
        <span
          className={`pointer-events-none col-start-1 row-start-1 whitespace-nowrap ${
            selected
              ? "opacity-0"
              : "group-hover/track:opacity-0 group-has-focus-visible/track:opacity-0"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <CheckBox
          checked={selected}
          className={`col-start-1 row-start-1 ${
            selected
              ? ""
              : "opacity-0 group-hover/track:opacity-100 group-has-focus-visible/track:opacity-100"
          }`}
        >
          <CheckIcon className="text-white" />
        </CheckBox>
      </button>
    </div>
  );
}

// dnd-kit 순서 변경을 위해 각 행을 별도 컴포넌트로 뽑았습니다. 드래그는 왼쪽 그립
// 아이콘(useSortable의 listeners)에만 걸려 있어서 번호 칸의 선택 체크박스와 서로
// 간섭하지 않습니다. 재생은 재생시간 자리의 hover 버튼으로만 합니다 — 행/썸네일
// 클릭은 재생을 트리거하지 않습니다(DurationPlayButton 주석 참고).
//
// 썸네일·제목·아티스트를 누르면 곡 상세 페이지로 이동합니다. 라이브러리 목록처럼 행
// 전체를 링크로 두지 않는 건, 이 행에는 드래그 손잡이·선택 체크박스가 같이 있어서
// 그 사이 빈 곳을 잘못 눌러도 페이지가 넘어가지 않게 하려는 것입니다. 그래서 링크는
// flex-1 없이 내용 폭만큼만 차지하고(min-w-0으로 좁아질 땐 마퀴 제목이 줄어듦), 제목
// 오른쪽 빈 공간은 눌리지 않습니다.
function SortableTrackRow({
  track,
  index,
  isCurrentTrack,
  selected,
  onToggleSelect,
  onPlay,
}: {
  track: Track;
  index: number;
  isCurrentTrack: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onPlay: () => void;
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
      className="group/track grid items-center gap-4 rounded-[11px] px-3.5 py-2.25 hover:bg-neu-row-hover"
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
        <TrackSelectCell
          index={index}
          isCurrentTrack={isCurrentTrack}
          selected={selected}
          onToggle={onToggleSelect}
          title={track.title}
        />
        <Link
          to={`/music/${track.id}`}
          className="flex min-w-0 items-center gap-3"
        >
          <TrackRowInfo track={track} isCurrentTrack={isCurrentTrack} />
        </Link>
      </div>
      <MarqueeText
        text={track.tags.map((tag) => `#${tag}`).join("  ")}
        className="text-xs text-neu-muted"
      />
      <div className="text-right font-neu-mono text-[12.5px] text-neu-muted">
        {track.play_count.toLocaleString()}
      </div>
      <DurationPlayButton
        duration={track.duration}
        onPlay={onPlay}
        label={`${track.title} 재생`}
        align="end"
        textClassName="font-neu-mono text-[12.5px] text-neu-muted"
        isCurrent={isCurrentTrack}
      />
    </div>
  );
}

// old-src/src/components/PlaylistInfo.js 를 대체합니다. docs/design/ 시안(1b-A)의
// 색상·그림자·치수는 그대로 두고, playlists/playlist_tracks 조회·트랙 추가는
// AddToPlaylistButton(MusicInfoPage)에서 처리하므로 여기서는 조회 + 삭제 + 곡 선택
// (선택 곡 일괄 삭제/다른 재생목록에 추가) + dnd-kit 순서 변경만 담당합니다.
export default function PlaylistInfoPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // 선택은 재생목록 id와 묶어 둡니다 — 다른 재생목록 페이지로 이동하면(같은
  // 컴포넌트 인스턴스가 재사용돼도) effect 없이 자연스럽게 빈 선택이 됩니다.
  const [selection, setSelection] = useState<{
    playlistId: string | undefined;
    ids: Set<string>;
  }>({ playlistId, ids: new Set() });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  // "전체 재생" 버튼 아이콘도 CD 플레이어 버튼·비주얼라이저와 같은 값으로 그립니다.
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isAudible = usePlayerStore(selectIsAudible);
  const isLoading = usePlayerStore(selectIsLoading);
  const playingPlaylistId = usePlayerStore((s) => s.playingPlaylistId);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const detachCurrentIfRemoved = usePlayerStore(
    (s) => s.detachCurrentIfRemoved,
  );

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

  // 재생 불가 곡은 duration이 비어 있어 총 시간에서 빠집니다.
  const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  // "전체 재생"/셔플은 첫 번째 재생 가능한 곡부터 시작합니다 — 재생 불가 곡만 있으면 막음.
  const firstPlayableIndex = tracks.findIndex(isTrackPlayable);
  const isThisPlaylistPlaying =
    playlistId !== undefined && playingPlaylistId === playlistId;
  const currentTrackId =
    isThisPlaylistPlaying
      ? selectCurrentTrack({ queue, currentIndex })?.id
      : undefined;

  const selectedIds =
    selection.playlistId === playlistId ? selection.ids : new Set<string>();
  // 트랙 목록 순서 그대로(= 다른 재생목록에 추가할 때 붙는 순서). 이미 빠진 곡의
  // id가 선택에 남아 있어도 여기서 자연스럽게 걸러집니다.
  const selectedTracks = tracks.filter((t) => selectedIds.has(t.id));
  const hasSelection = selectedTracks.length > 0;
  const allSelected =
    tracks.length > 0 && selectedTracks.length === tracks.length;

  function setSelectedIds(ids: Set<string>) {
    setSelection({ playlistId, ids });
  }

  function toggleSelect(trackId: string) {
    setSelectedIds(toggleInSet(selectedIds, trackId));
  }

  // 헤더 # 칸 체크박스 — 전체가 선택돼 있을 때만 전체 해제, 그 외(일부 선택
  // 포함)엔 전체 선택입니다(부분 선택을 따로 표시하지 않음).
  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(tracks.map((t) => t.id)));
  }

  const deletePlaylistMutation = useMutation({
    mutationFn: () => deletePlaylist(playlistId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey(user?.id) });
      // 담겨 있던 곡들이 전부 이 재생목록 소속에서 빠지므로(on delete cascade)
      // 곡 상세의 "재생목록에 추가" 모달 체크 상태도 전부 다시 가져옵니다.
      queryClient.invalidateQueries({ queryKey: allPlaylistMembershipsQueryKey });
      navigate("/");
    },
  });

  const removeTracksMutation = useMutation({
    mutationFn: (trackIds: string[]) =>
      removeTracksFromPlaylist(playlistId!, trackIds),
    onSuccess: (_data, trackIds) => {
      invalidatePlaylistMembership(queryClient, user?.id, {
        playlistIds: [playlistId!],
        trackIds,
      });
      setSelectedIds(new Set());
      showToast(`재생목록에서 ${trackIds.length}곡을 삭제했습니다.`);
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
    else if (playlistId) playQueue(tracks, firstPlayableIndex, playlistId);
  }

  function handleShuffleClick() {
    if (!isThisPlaylistPlaying && playlistId)
      playQueue(tracks, firstPlayableIndex, playlistId);
    toggleShuffle();
  }

  // old-src(PlaylistInfo.js)의 deleteFromPlaylist와 같은 순서 — 지금 재생 중인
  // 곡이 삭제 대상에 들어 있으면, 먼저 재생목록 컨텍스트에서 떼어낸(단독 재생으로
  // 전환) 뒤에 실제 제거 mutation을 보냅니다. 순서를 반대로 하면 큐가 방금 DB에서
  // 빠진 트랙을 여전히 "이 재생목록 소속"으로 가리키는 순간이 생깁니다.
  function handleRemoveSelected() {
    const trackIds = selectedTracks.map((t) => t.id);
    if (trackIds.length === 0) return;
    detachCurrentIfRemoved([playlistId!], trackIds);
    removeTracksMutation.mutate(trackIds);
  }

  if (isPlaylistLoading || isTracksLoading) {
    return <MutedNote>불러오는 중...</MutedNote>;
  }
  if (isPlaylistError || !playlist) {
    return <MutedNote>재생목록을 찾을 수 없습니다.</MutedNote>;
  }

  return (
    <div>
      {/* "재생목록" 라벨은 제목 위가 아니라 커버 위, 본문 왼쪽 끝에 둡니다(사용자 요청).
          아래 여백(mb-2.5)은 예전 라벨↔제목 간격과 같은 값입니다. */}
      <p className="mb-2.5 text-[11.5px] font-bold tracking-[0.08em] text-neu-hi">
        재생목록
      </p>
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
          <h1 className="mb-3 text-[40px] font-extrabold leading-[1.04] tracking-[-0.045em] text-neu-ink">
            <MarqueeText text={playlist.title} />
          </h1>
          <p className="text-[13px] text-neu-muted">
            {tracks.length}곡 · {Math.floor(totalSeconds / 60)}분{" "}
            {totalSeconds % 60}초
          </p>

          <div className="mt-4.5 flex items-center gap-3">
            <PlayPauseButton
              playing={isThisPlaylistPlaying && isAudible}
              loading={isThisPlaylistPlaying && isLoading}
              onClick={handlePlayClick}
              disabled={firstPlayableIndex === -1}
              playLabel="전체 재생"
            />
            <IconCircleButton
              size="xl"
              tooltip="셔플"
              onClick={handleShuffleClick}
              disabled={firstPlayableIndex === -1}
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
              tooltip={
                isThisPlaylistPlaying
                  ? "재생 중인 재생목록은 삭제할 수 없습니다"
                  : "삭제"
              }
              onClick={() => setConfirmingDelete(true)}
              disabled={deletePlaylistMutation.isPending || isThisPlaylistPlaying}
              aria-label="재생목록 삭제"
              className={`${secondaryCircleButtonClass} text-(--neu-ink-34) enabled:hover:text-(--neu-danger)`}
            >
              <TrashIcon />
            </IconCircleButton>
          </div>
        </div>
      </div>

      <div className="mt-6.5">
        <div
          className="group/header grid gap-4 px-3.5 pb-2.5 text-[11px] font-bold tracking-wider text-neu-muted"
          style={{
            gridTemplateColumns: trackRowGridColumns,
            borderBottom: "1px solid var(--neu-divider)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-5.5 flex-none" />
            {/* # 칸 — 헤더 hover 또는 선택된 곡이 있으면 전체 선택 체크박스로
                바뀝니다. 체크박스(20px)가 헤더 글자보다 커서 버튼을 absolute로 띄워
                헤더 행 높이는 그대로 두고, 눌리는 범위는 행과 같이 체크박스
                크기(size-5)로만 둡니다. 버튼이 positioned라 opacity-0이 된 "#"보다
                항상 위에 그려져 클릭을 뺏기지 않습니다. */}
            <div className="relative w-8.5 flex-none">
              <span
                className={
                  hasSelection
                    ? "opacity-0"
                    : "group-hover/header:opacity-0 group-has-focus-visible/header:opacity-0"
                }
              >
                #
              </span>
              {tracks.length > 0 && (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={allSelected}
                  aria-label="전체 선택"
                  onClick={toggleSelectAll}
                  className="absolute top-1/2 left-0 size-5 -translate-y-1/2 cursor-pointer"
                >
                  <CheckBox
                    checked={allSelected}
                    className={
                      hasSelection
                        ? ""
                        : "opacity-0 group-hover/header:opacity-100 group-has-focus-visible/header:opacity-100"
                    }
                  >
                    <CheckIcon className="text-white" />
                  </CheckBox>
                </button>
              )}
            </div>
            <div className="pl-19.5">제목</div>
          </div>
          <div>태그</div>
          <div className="text-right">재생 횟수</div>
          <div className="text-right">시간</div>
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
              {/* 선택 중에는 하단에 떠 있는 액션 바가 마지막 행을 가리지 않도록
                  그만큼 아래 여백을 둡니다. */}
              <div
                className={`flex flex-col pt-1.5 ${hasSelection ? "pb-20" : ""}`}
              >
                {tracks.map((track, index) => (
                  <SortableTrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    isCurrentTrack={track.id === currentTrackId}
                    selected={selectedIds.has(track.id)}
                    onToggleSelect={() => toggleSelect(track.id)}
                    onPlay={() =>
                      playlistId &&
                      playTrackAndOpenQueue(tracks, index, playlistId)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {hasSelection && (
        <SelectionActionBar
          count={selectedTracks.length}
          onRemove={handleRemoveSelected}
          onAddToPlaylist={() => setAddModalOpen(true)}
          onClear={() => setSelectedIds(new Set())}
          isRemoving={removeTracksMutation.isPending}
        />
      )}

      {playlistId && (
        <AddTracksToPlaylistModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          currentPlaylistId={playlistId}
          tracks={selectedTracks}
          onAdded={() => {
            setAddModalOpen(false);
            setSelectedIds(new Set());
          }}
        />
      )}

      <ConfirmModal
        open={confirmingDelete}
        onClose={() => {
          setConfirmingDelete(false);
          deletePlaylistMutation.reset();
        }}
        onConfirm={() => deletePlaylistMutation.mutate()}
        isPending={deletePlaylistMutation.isPending}
        errorMessage={
          deletePlaylistMutation.isError ? "삭제에 실패했습니다." : null
        }
        title="정말 삭제하시겠어요?"
        description={`"${playlist.title}" 재생목록이 삭제되며 되돌릴 수 없습니다. 담긴 곡은 라이브러리에 그대로 남습니다.`}
        confirmLabel="삭제"
      />
    </div>
  );
}
