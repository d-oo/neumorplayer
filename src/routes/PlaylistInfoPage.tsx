import { useParams } from "react-router-dom";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatDuration } from "@/lib/format-time";
import { PlayIcon } from "@/features/player/icons";
import type { Database } from "@/lib/database.types";

type Track = Database["public"]["Tables"]["tracks"]["Row"];

const thumbBackground =
  "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 5px, rgba(118,100,145,0.05) 5px 10px), color-mix(in oklab, #b344ff 14%, transparent)";
const thumbShadow =
  "3px 3px 8px rgba(150,136,175,0.42), -2px -2px 6px rgba(255,255,255,0.92)";
const pillSecondaryStyle = {
  background: "oklch(0.935 0.013 315)",
  boxShadow:
    "7px 7px 16px rgba(150,136,175,0.45), -5px -5px 12px rgba(255,255,255,0.95)",
};

// old-src/src/components/PlaylistInfo.js 를 대체할 자리. docs/design/ 시안(1b-A)의
// 색상·그림자·치수를 그대로 옮겼습니다.
// TODO: playlistId로 playlists 단건 + playlist_tracks를 position 순으로 조회하세요
// (dnd-kit으로 순서 변경 시 position batch update). 지금은 데이터가 없어서 항상
// 빈 재생목록으로 보입니다.
export default function PlaylistInfoPage() {
  const { playlistId } = useParams<{ playlistId: string }>();

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playingPlaylistId = usePlayerStore((s) => s.playingPlaylistId);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  const title = "";
  const owner = "";
  const tracks: Track[] = [];
  const totalSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);
  const isThisPlaylistPlaying =
    playlistId !== undefined && playingPlaylistId === playlistId;
  const currentTrackId =
    isThisPlaylistPlaying && currentIndex >= 0
      ? queue[currentIndex]?.id
      : undefined;

  function handlePlayClick() {
    if (isThisPlaylistPlaying) setIsPlaying(!isPlaying);
    else if (playlistId) playQueue(tracks, 0, playlistId);
  }

  function handleShuffleClick() {
    if (!isThisPlaylistPlaying && playlistId) playQueue(tracks, 0, playlistId);
    toggleShuffle();
  }

  return (
    <div>
      <p className="mb-4 text-xs text-neu-muted">playlist id: {playlistId}</p>

      <div className="flex items-end gap-5.5">
        <div
          className="flex h-34.75 w-62 flex-none flex-col items-center justify-center rounded-xl border border-white/80 text-center"
          style={{
            background:
              "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 9px, rgba(118,100,145,0.05) 9px 18px), linear-gradient(160deg, color-mix(in oklab, #b344ff 14%, transparent), transparent 70%)",
            boxShadow:
              "9px 9px 20px rgba(142,128,166,0.45), -7px -7px 16px rgba(255,255,255,0.92)",
          }}
        >
          <p className="font-neu-mono text-[10px] leading-[1.7] tracking-widest text-[oklch(0.47_0.025_315)]">
            커버 이미지
            <br />
            1920 × 1080
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[11.5px] font-bold tracking-[0.08em] text-neu-hi">
            재생목록
          </p>
          <h1 className="mt-2.5 mb-3 text-[44px] font-extrabold leading-[1.04] tracking-[-0.045em] text-neu-ink">
            {title}
          </h1>
          <p className="text-[13px] text-[oklch(0.47_0.025_315)]">
            {owner} · {tracks.length}곡 · {Math.floor(totalSeconds / 60)}분{" "}
            {totalSeconds % 60}초
          </p>

          <div className="mt-4.5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePlayClick}
              className="flex items-center gap-2.25 whitespace-nowrap rounded-full px-5 py-2.75 text-sm font-bold text-white transition-[filter] hover:brightness-110"
              style={{
                background: "var(--neu-accent-light)",
                boxShadow:
                  "7px 7px 16px rgba(142,128,166,0.5), -4px -4px 12px rgba(255,255,255,0.9)",
              }}
            >
              <PlayIcon />
              {isThisPlaylistPlaying && isPlaying ? "일시정지" : "전체 재생"}
            </button>
            <button
              type="button"
              onClick={handleShuffleClick}
              className="whitespace-nowrap rounded-full border border-white/85 px-4.5 py-2.75 text-sm font-semibold text-[oklch(0.34_0.025_315)] hover:text-neu-hi active:shadow-neu-pill-active"
              style={pillSecondaryStyle}
            >
              셔플
            </button>
            <button
              type="button"
              // TODO: 재생목록 저장/복제 기능 구현
              className="whitespace-nowrap rounded-full border border-white/85 px-4.5 py-2.75 text-sm font-semibold text-[oklch(0.34_0.025_315)] hover:text-neu-hi active:shadow-neu-pill-active"
              style={pillSecondaryStyle}
            >
              저장
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6.5">
        <div
          className="grid gap-4 px-3.5 pb-2.5 text-[11px] font-bold tracking-wider text-[oklch(0.47_0.025_315)]"
          style={{
            gridTemplateColumns: "34px minmax(0,1fr) 170px 74px 62px",
            borderBottom: "1px solid rgba(142,128,166,0.28)",
          }}
        >
          <div>#</div>
          <div>제목</div>
          <div>태그</div>
          <div className="text-right">재생 횟수</div>
          <div className="text-right">시간</div>
        </div>

        <div className="flex flex-col pt-1.5">
          {tracks.map((track, index) => {
            const isCurrentTrack = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                onClick={() =>
                  playlistId && playQueue(tracks, index, playlistId)
                }
                className="grid cursor-pointer items-center gap-4 rounded-[11px] px-3.5 py-2.25 hover:bg-[rgba(120,100,145,0.09)]"
                style={{
                  gridTemplateColumns: "34px minmax(0,1fr) 170px 74px 62px",
                  background: isCurrentTrack
                    ? "oklch(0.945 0.035 313)"
                    : "transparent",
                  boxShadow: isCurrentTrack
                    ? "2px 2px 6px rgba(150,136,175,0.38), -2px -2px 5px rgba(255,255,255,0.8)"
                    : "none",
                }}
              >
                <div
                  className="font-neu-mono text-[12.5px]"
                  style={{
                    color: isCurrentTrack ? "#6d1a9f" : "oklch(0.47 0.025 315)",
                  }}
                >
                  {isCurrentTrack ? (
                    <div className="flex h-3.5 items-end gap-0.5">
                      <span
                        className="w-0.75 rounded-xs bg-neu-accent-light"
                        style={{
                          animation:
                            "neu-eq 0.72s ease-in-out infinite alternate",
                        }}
                      />
                      <span
                        className="w-0.75 rounded-xs bg-neu-accent-light"
                        style={{
                          animation:
                            "neu-eq 0.55s ease-in-out 0.1s infinite alternate",
                        }}
                      />
                      <span
                        className="w-0.75 rounded-xs bg-neu-accent-light"
                        style={{
                          animation:
                            "neu-eq 0.86s ease-in-out 0.22s infinite alternate",
                        }}
                      />
                    </div>
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </div>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className="h-8.5 w-15 flex-none rounded-md border border-white/70"
                    style={{
                      background: thumbBackground,
                      boxShadow: thumbShadow,
                    }}
                  />
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{
                        color: isCurrentTrack
                          ? "#6d1a9f"
                          : "oklch(0.3 0.025 315)",
                      }}
                    >
                      {track.title}
                    </p>
                    <p className="mt-0.75 truncate text-[12.5px] text-[oklch(0.46_0.025_315)]">
                      {track.artist.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="truncate text-xs text-[oklch(0.47_0.025_315)]">
                  {track.tags.map((tag) => `#${tag}`).join("  ")}
                </div>
                <div className="text-right font-neu-mono text-[12.5px] text-[oklch(0.47_0.025_315)]">
                  {track.play_count.toLocaleString()}
                </div>
                <div className="text-right font-neu-mono text-[12.5px] text-[oklch(0.46_0.025_315)]">
                  {formatDuration(track.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
