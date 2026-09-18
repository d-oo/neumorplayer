import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { formatDuration } from "@/lib/format-time";

// 시안(docs/design/)의 "다음 트랙/재생목록" 카드. "재생목록" 탭은 지금 재생 중인
// 재생목록의 트랙 목록이 아니라 — 원본 코드(PLAYLISTS.map)를 보면 — 내 재생목록
// 목록(이동 링크)입니다. 헷갈렸던 부분이라 남겨둡니다.
// TODO: "재생목록" 탭은 실제 playlists 테이블 조회로 채우세요(지금은 빈 목록).
const rowHoverClass = "hover:bg-[rgba(120,100,145,0.09)]";
const thumbBackground =
  "repeating-linear-gradient(135deg, rgba(118,100,145,0.16) 0 5px, rgba(118,100,145,0.05) 5px 10px), color-mix(in oklab, #b344ff 14%, transparent)";
const thumbShadow =
  "3px 3px 8px rgba(150,136,175,0.42), -2px -2px 6px rgba(255,255,255,0.92)";

interface PlaylistLink {
  id: string;
  name: string;
  meta: string;
}

const playlists: PlaylistLink[] = [];

export default function QueueCard() {
  const navigate = useNavigate();
  const [queueView, setQueueView] = useState<"next" | "playlist">("next");

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playingPlaylistId = usePlayerStore((s) => s.playingPlaylistId);
  const jumpTo = usePlayerStore((s) => s.jumpTo);

  const upcoming = queue.slice(currentIndex + 1);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-neu-surface shadow-neu-raised">
      <div
        className="mx-3.5 mt-3.5 mb-2.5 flex gap-1 rounded-[13px] border border-white/70 p-1"
        style={{
          background: "oklch(0.908 0.014 315)",
          boxShadow:
            "inset 3px 3px 7px rgba(150,136,175,0.34), inset -3px -3px 6px rgba(255,255,255,0.85)",
        }}
      >
        <button
          type="button"
          onClick={() => setQueueView("next")}
          className="flex-1 whitespace-nowrap rounded-[9px] px-2.5 py-2 text-[12.5px] font-bold hover:text-[oklch(0.24_0.025_315)]"
          style={{
            color: queueView === "next" ? "#6d1a9f" : "oklch(0.47 0.025 315)",
            background:
              queueView === "next"
                ? "color-mix(in oklab, #b344ff 14%, transparent)"
                : "transparent",
            boxShadow:
              queueView === "next"
                ? "2px 2px 5px rgba(150,136,175,0.34), -2px -2px 4px rgba(255,255,255,0.7)"
                : "none",
          }}
        >
          재생 트랙
        </button>
        <button
          type="button"
          onClick={() => setQueueView("playlist")}
          className="flex-1 whitespace-nowrap rounded-[9px] px-2.5 py-2 text-[12.5px] font-bold hover:text-[oklch(0.24_0.025_315)]"
          style={{
            color:
              queueView === "playlist" ? "#6d1a9f" : "oklch(0.47 0.025 315)",
            background:
              queueView === "playlist"
                ? "color-mix(in oklab, #b344ff 14%, transparent)"
                : "transparent",
            boxShadow:
              queueView === "playlist"
                ? "2px 2px 5px rgba(150,136,175,0.34), -2px -2px 4px rgba(255,255,255,0.7)"
                : "none",
          }}
        >
          재생목록
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3.5">
        {queueView === "next" ? (
          upcoming.length > 0 ? (
            <div className="flex flex-col gap-0.75">
              {upcoming.map((track, i) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => jumpTo(currentIndex + 1 + i)}
                  className={`flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 text-left ${rowHoverClass}`}
                >
                  <div
                    className="h-8 w-14 flex-none rounded-md border border-white/70"
                    style={{
                      background: thumbBackground,
                      boxShadow: thumbShadow,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-4.5 text-neu-ink">
                      {track.title}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] leading-3.75 text-[oklch(0.46_0.025_315)]">
                      {track.artist.join(", ")}
                    </p>
                  </div>
                  <span className="font-neu-mono text-[11.5px] text-neu-muted">
                    {formatDuration(track.duration)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-2 py-1.75 text-sm text-neu-muted">
              다음 곡이 없습니다.
            </p>
          )
        ) : playlists.length > 0 ? (
          <div className="flex flex-col gap-0.75">
            {playlists.map((pl) => {
              const isActive = pl.id === playingPlaylistId;
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                  className={`flex items-center gap-2.75 rounded-[10px] px-2 py-1.75 text-left ${rowHoverClass} ${
                    isActive ? "bg-[oklch(0.945_0.035_313)]" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow:
                            "2px 2px 6px rgba(150,136,175,0.38), -2px -2px 5px rgba(255,255,255,0.8)",
                        }
                      : undefined
                  }
                >
                  <div
                    className="h-8 w-14 flex-none rounded-md border border-white/70"
                    style={{
                      background: thumbBackground,
                      boxShadow: thumbShadow,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-4.5 text-neu-ink">
                      {pl.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] leading-3.75 text-neu-muted">
                      {pl.meta}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="px-2 py-1.75 text-sm text-neu-muted">
            아직 만든 재생목록이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
