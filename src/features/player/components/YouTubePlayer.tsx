import { useEffect, useRef, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { selectCurrentTrack, usePlayerStore } from "../lib/usePlayerStore";
import { findPlayableIndex } from "../lib/queue-navigation";
import { pushOutOfRects } from "../lib/avoid-rects";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { supabase } from "@/shared/lib/supabase";
import { useToastStore } from "@/shared/lib/useToastStore";
import { trackQueryKey, tracksQueryKey } from "@/features/library/lib/tracks";
import { useVideoSlot } from "../hooks/useVideoSlot";
import { useYouTubePlayback } from "../hooks/useYouTubePlayback";
import PlaybackIframe from "./PlaybackIframe";

// 미니 플레이어 박스 크기 — MusicInfoPage의 영상 영역(h-51.75 w-92)과 정확히
// 같은 크기라, 도킹된 상태에서 그 자리를 크기 보간 없이 그대로 덮을 수 있습니다.
const BOX_WIDTH = 368;
const BOX_HEIGHT = 207;
// 떠 있을 때(도킹 안 됨) 기본 위치의 화면 오른쪽 여백.
const FLOATING_RIGHT = 20;
// 떠 있을 때 플레이어 아랫변이 화면 바닥에서 최소한 떨어져야 하는 거리 — 기본 위치도
// 이 높이이고, 손잡이로 끌어도 이보다 아래로는 못 내려갑니다. 두 조건 중 큰 값입니다.
// - 토스트(shared/components/Toast.tsx): 왼쪽 아래에 플레이어보다 위 층(z-40)으로 뜨는데,
//   영상 앞에 겹치면 YouTube RMF "Overlays and frames"(플레이어 앞에 다른 요소 금지)
//   위반이라 토스트 윗변(bottom-5 20px + 높이 50px = 70px)보다 10px 위까지만 허용합니다.
//   메시지가 길면 토스트가 오른쪽까지 넓어져서 화면 전체 폭에 같은 선을 적용합니다.
// - 대시보드 푸터(DashboardFooter): 화면 바깥 여백 12px(HomeLayout p-3) + 푸터 40px +
//   그 위 음각 홈 2px + 간격 8px = 62px.
// 토스트나 푸터 높이가 바뀌면 이 값도 고치세요.
const TOAST_CLEARANCE = 70 + 10;
const FOOTER_CLEARANCE = 12 + 40 + 2 + 8;
const FLOATING_BOTTOM = Math.max(TOAST_CLEARANCE, FOOTER_CLEARANCE);
const TRANSITION_MS = 350;
// 떠 있을 때 영상 위에 붙는 손잡이 바(높이 14px + 영상과의 간격 6px). 영상 iframe 위에서는
// 마우스 이벤트가 YouTube 쪽으로만 가서 영상을 직접 잡아 끌 수 없고, 영상을 투명한 막으로
// 덮으면 플레이어 안의 YouTube 링크(제목·로고 등)를 막게 되어(YouTube API Developer
// Policies III.I.4) 영상과 겹치지 않는 별도 손잡이로 옮깁니다.
const HANDLE_SPACE = 20;
// 끌어서 옮길 때 화면 가장자리와 최소 간격 — 재생 중인 플레이어가 화면 밖으로 나가지
// 않게 합니다("화면 밖 배경 재생 금지", 아래 주석 참고).
const VIEWPORT_MARGIN = 8;
// 모달 카드와 플레이어(손잡이 포함) 사이에 비워 두는 간격.
const MODAL_GAP = 12;

// HomeLayout에 항상 마운트해두는 컴포넌트입니다. music/:musicId 라우트를 벗어나도
// 이 컴포넌트 자체는 언마운트되지 않아야 배경 재생이 끊기지 않으므로, 실제 iframe은
// document.body에 딱 한 번만 포탈링해두고(포탈 대상 자체를 절대 바꾸지 않습니다 —
// 대상이 바뀌면 그 순간 DOM에서 떨어져 나가 재생이 끊깁니다) 그 박스의 화면 좌표만
// requestAnimationFrame으로 매 프레임 갱신합니다. VideoSlotProvider에 등록된 앵커가
// 있으면(재생 중인 트랙의 MusicInfoPage) 그 앵커의 getBoundingClientRect() 좌표를,
// 없으면 떠 있는 좌표(기본은 화면 우측 하단, 손잡이 바로 끌어 옮기면 그 자리 — 새로고침
// 전까지만 기억)를 목표로 삼습니다 — YouTube API Developer Policies의
// "화면 밖 배경 재생 금지" 요구사항을 항상 만족합니다(재생 중엔 둘 중 어디에 있든
// 실제로 화면에 보임). 도킹 여부가 바뀌는 순간에만 잠깐 CSS transition을 켜서 두 위치
// 사이를 미끄러지듯 이동시키고, 스크롤 등으로 계속 좌표가 바뀌는 동안은 transition을
// 꺼서 버벅임 없이 즉시 따라가게 합니다.
export default function YouTubePlayer() {
  const { anchorEl } = useVideoSlot();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const anchorElRef = useRef<HTMLDivElement | null>(anchorEl);
  const wasDockedRef = useRef<boolean | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  // 사용자가 손잡이로 옮긴 떠 있는 위치(박스 좌상단). null이면 기본 위치(우측 하단).
  // 화면 안으로 맞추는 건 매 프레임 computeTarget이 하므로 여기엔 끌어다 놓은 값 그대로
  // 둡니다 — 창을 줄였다 다시 키우면 원래 놓은 자리로 돌아갑니다.
  const floatingPosRef = useRef<{ left: number; top: number } | null>(null);
  // 지금 화면에 그린 박스 좌표(끌기 시작할 때 손잡이와 박스 사이 거리 계산용).
  const renderedPosRef = useRef({ left: 0, top: 0 });
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const setIsVideoPlaying = usePlayerStore((s) => s.setIsVideoPlaying);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const pendingSeek = usePlayerStore((s) => s.pendingSeek);
  const clearPendingSeek = usePlayerStore((s) => s.clearPendingSeek);
  const isScrubbing = usePlayerStore((s) => s.isScrubbing);

  const showToast = useToastStore((s) => s.show);

  const currentTrack = selectCurrentTrack({ queue, currentIndex });
  const currentTrackId = currentTrack?.id;

  // 재생 오류로 연달아 건너뛴 곡 수. 실제로 재생이 시작되면(PLAYING) 0으로 돌아갑니다.
  // 반복 재생 중 큐의 곡이 전부 오류를 내면(예: 네트워크 문제로 모든 영상이 실패)
  // 다음 곡 → 오류 → 다음 곡이 끝없이 돌지 않도록, 큐 길이만큼 연달아 실패하면 멈춥니다.
  const consecutiveErrorsRef = useRef(0);

  function handlePlayingChange(playing: boolean) {
    if (playing) consecutiveErrorsRef.current = 0;
    setIsPlaying(playing);
  }

  // YouTube가 재생 오류를 알려오면(DB에서 아직 재생 불가로 표시되기 전에 삭제·비공개된
  // 영상, 퍼가기 금지 영상 등) 이 곡으로 올 때의 방향(navDirection)으로 계속 건너뜁니다 —
  // 다음 곡/곡이 끝나서 왔으면 다음 곡으로, 이전 곡 버튼으로 왔으면 그 앞 곡으로
  // (usePlayerStore.playNext/playPrev와 같은 findPlayableIndex 규칙). 그 방향에 넘어갈
  // 곡이 없으면 그 자리에서 멈춥니다. 어느 쪽이든 토스트로 알려서 곡이 말없이 바뀌지
  // 않게 합니다.
  function handlePlaybackError() {
    // 렌더 시점 값이 아니라 오류가 온 시점의 최신 큐를 봅니다.
    const state = usePlayerStore.getState();
    const failed = selectCurrentTrack(state);
    if (!failed) return;
    consecutiveErrorsRef.current += 1;
    const step = state.navDirection;
    const target = findPlayableIndex(
      state.queue,
      state.currentIndex,
      step,
      state.loopQueue,
    );
    const canSkip =
      target !== -1 &&
      target !== state.currentIndex &&
      consecutiveErrorsRef.current < state.queue.length;
    if (canSkip) {
      showToast(
        `"${failed.title}"을(를) 재생할 수 없어 ${
          step === 1 ? "다음" : "이전"
        } 곡으로 넘어갑니다.`,
      );
      if (step === 1) playNext();
      else playPrev();
    } else {
      consecutiveErrorsRef.current = 0;
      setIsPlaying(false);
      showToast(`"${failed.title}"을(를) 재생할 수 없습니다.`);
    }
  }

  // 재생/일시정지 명령·볼륨·진행 시간 폴링·이동·상태 이벤트·끝남·오류 처리는 랜딩
  // (useGuestPlayer)과 공유하는 useYouTubePlayback이 담당합니다.
  const playback = useYouTubePlayback({
    videoId: currentTrack?.video_id,
    isPlaying,
    volume,
    muted,
    onPlayingChange: handlePlayingChange,
    onVideoPlayingChange: setIsVideoPlaying,
    onProgress: setProgress,
    onEnd: playNext,
    onError: handlePlaybackError,
  });
  const { seek, setScrubbing } = playback;

  // PlayerPanel(물리 훅)이 스토어에 남긴 스크럽 시작/끝을 재생 훅에 전달합니다 —
  // 스크럽 중엔 재생 훅이 폴링 값을 무시합니다.
  useEffect(() => {
    setScrubbing(isScrubbing);
  }, [isScrubbing, setScrubbing]);

  useEffect(() => {
    anchorElRef.current = anchorEl;
  }, [anchorEl]);

  // currentTrack에만 의존합니다(anchorEl 변경마다 effect를 다시 만들지 않고, 이미
  // 돌고 있는 루프가 매 프레임 anchorElRef.current를 읽게 해서 도킹 여부가 바뀌어도
  // 애니메이션 판단(wasDockedRef)이 끊기지 않게 합니다).
  useEffect(() => {
    if (!currentTrackId) return;
    const box = boxRef.current;
    if (!box) return;

    function computeTarget() {
      const anchor = anchorElRef.current;
      // anchor.isConnected를 따로 확인하는 이유: 라우트를 벗어나면 그 문서 노드는
      // React 커밋 시점에 곧바로 DOM에서 제거되지만, anchorElRef는 setAnchorEl(null)의
      // effect가 한 박자 늦게 돌기 전까지 그 "이미 제거된" 노드를 계속 들고 있습니다.
      // 문서에서 떨어져 나간 노드의 getBoundingClientRect()는 전부 0을 반환하므로,
      // 이 확인이 없으면 그 한두 프레임 동안 목표 좌표가 (0,0)이 되어 좌측 상단으로
      // 튀었다가 다시 우측 하단으로 이동하는 것처럼 보입니다.
      const docked = !!anchor && anchor.isConnected;
      const topExtra = docked ? 0 : HANDLE_SPACE;
      const bounds = {
        minLeft: VIEWPORT_MARGIN,
        maxLeft: window.innerWidth - VIEWPORT_MARGIN - BOX_WIDTH,
        minTop: VIEWPORT_MARGIN + topExtra,
        maxTop: window.innerHeight - FLOATING_BOTTOM - BOX_HEIGHT,
      };

      let pos: { left: number; top: number };
      if (docked) {
        const rect = anchor!.getBoundingClientRect();
        pos = { left: rect.left, top: rect.top };
      } else {
        const raw = floatingPosRef.current ?? {
          top: window.innerHeight - FLOATING_BOTTOM - BOX_HEIGHT,
          left: window.innerWidth - FLOATING_RIGHT - BOX_WIDTH,
        };
        pos = {
          left: Math.max(bounds.minLeft, Math.min(raw.left, bounds.maxLeft)),
          top: Math.max(bounds.minTop, Math.min(raw.top, bounds.maxTop)),
        };
      }

      // 열려 있는 모달 카드(shared/components/Modal의 data-modal-card)와 겹치면 밀어냅니다.
      // 플레이어는 모달보다 위 층이라(아래 z-60 주석) 겹친 채로 두면 플레이어가 모달
      // 내용을 가리고, 반대로 두면 모달이 영상을 가려 YouTube RMF "Overlays and frames"
      // 위반이 됩니다. 끌어서 모달 쪽으로 옮겨도 같은 계산으로 막힙니다. 밀어낸 위치는
      // floatingPosRef에 저장하지 않아서, 모달을 닫으면 원래 자리(도킹 중이면 곡 정보
      // 페이지의 영상 자리)로 돌아갑니다.
      const modalRects = Array.from(
        document.querySelectorAll<HTMLElement>("[data-modal-card]"),
        (el) => el.getBoundingClientRect(),
      );
      const pushed = pushOutOfRects(
        pos,
        { width: BOX_WIDTH, height: BOX_HEIGHT, topExtra },
        modalRects,
        bounds,
        MODAL_GAP,
      );
      const avoiding = pushed.left !== pos.left || pushed.top !== pos.top;
      return { ...pushed, docked, avoiding };
    }

    // 손잡이 바는 떠 있을 때만 보입니다(도킹 상태에선 곡 정보 페이지의 영상 자리를 정확히
    // 덮어야 하므로 숨김). 도킹 여부는 이 루프만 알고 있어서 data 속성으로 넘깁니다.
    function applyDocked(docked: boolean) {
      if (docked) box!.dataset.docked = "";
      else delete box!.dataset.docked;
    }

    // 최초 배치는 어딘가에서 미끄러져 오는 게 아니라 바로 제자리에 나타나야 하므로
    // transition 없이 한 번 스냅합니다.
    const initial = computeTarget();
    box.style.transition = "none";
    box.style.transform = `translate(${initial.left}px, ${initial.top}px)`;
    renderedPosRef.current = { left: initial.left, top: initial.top };
    wasDockedRef.current = initial.docked;
    applyDocked(initial.docked);
    let wasAvoiding = initial.avoiding;

    let rafId: number;
    function tick() {
      const target = computeTarget();
      const current = boxRef.current;
      if (current) {
        // 도킹 여부가 바뀔 때, 그리고 모달이 열려 밀려나거나 닫혀 돌아올 때만 잠깐
        // transition을 켜서 미끄러지듯 움직입니다. 손잡이로 끄는 중엔 손을 바로 따라가야
        // 하므로 밀려나도 transition을 켜지 않습니다.
        const avoidingChanged = wasAvoiding !== target.avoiding;
        wasAvoiding = target.avoiding;
        if (
          wasDockedRef.current !== target.docked ||
          (avoidingChanged && !dragOffsetRef.current)
        ) {
          current.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`;
          if (transitionTimeoutRef.current !== null) {
            window.clearTimeout(transitionTimeoutRef.current);
          }
          transitionTimeoutRef.current = window.setTimeout(() => {
            if (boxRef.current) boxRef.current.style.transition = "none";
          }, TRANSITION_MS + 10);
          wasDockedRef.current = target.docked;
          applyDocked(target.docked);
        }
        current.style.transform = `translate(${target.left}px, ${target.top}px)`;
        renderedPosRef.current = { left: target.left, top: target.top };
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [currentTrackId]);

  // PlayerPanel의 드래그/CD 스크럽이 스토어에 남긴 이동 요청을 YouTube로 보냅니다
  // (화면의 currentTime은 requestSeek가 이미 옮겨 둠).
  useEffect(() => {
    if (pendingSeek === null) return;
    seek(pendingSeek);
    clearPendingSeek();
  }, [pendingSeek, clearPendingSeek, seek]);

  // old-src(Home.js)가 재생 중인 곡이 바뀔 때마다 IndexedDB의 playCount/recentPlay를
  // 갱신하던 것과 같은 지점 — 큐에서 재생 대상이 바뀔 때마다(재생목록 자동 다음곡
  // 포함) 한 번씩 증가시킵니다. 최신 play_count를 다시 읽고 나서 +1 하므로 다른
  // 탭에서 이미 늘어난 값을 덮어쓰지 않습니다(단, 두 값이 동시에 갱신되는 경쟁은
  // 여전히 가능 — 개인용 앱 규모에서는 감수).
  useEffect(() => {
    if (!currentTrackId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("tracks")
        .select("play_count")
        .eq("id", currentTrackId)
        .single();
      if (cancelled || !data) return;
      await supabase
        .from("tracks")
        .update({
          play_count: data.play_count + 1,
          recent_play: new Date().toISOString(),
        })
        .eq("id", currentTrackId);
      if (cancelled) return;
      queryClient.invalidateQueries({ queryKey: tracksQueryKey(user?.id) });
      queryClient.invalidateQueries({ queryKey: trackQueryKey(currentTrackId) });
    })();
    return () => {
      cancelled = true;
    };
  }, [currentTrackId, queryClient, user?.id]);

  // 손잡이 바 끌기. 잡는 동안 박스에 data-dragging을 달아 iframe의 마우스 입력을 끕니다 —
  // 커서가 iframe 위로 지나가도 이벤트를 YouTube가 가져가지 않고 계속 손잡이로 옵니다.
  function handleDragStart(e: PointerEvent<HTMLDivElement>) {
    const box = boxRef.current;
    if (!box) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    // 도킹이 풀리며 미끄러지는 중(transition)에 잡아도 손을 바로 따라오게 합니다.
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    box.style.transition = "none";
    box.dataset.dragging = "";
    const { left, top } = renderedPosRef.current;
    dragOffsetRef.current = { x: e.clientX - left, y: e.clientY - top };
  }

  function handleDragMove(e: PointerEvent<HTMLDivElement>) {
    const offset = dragOffsetRef.current;
    if (!offset) return;
    floatingPosRef.current = {
      left: e.clientX - offset.x,
      top: e.clientY - offset.y,
    };
  }

  function handleDragEnd() {
    dragOffsetRef.current = null;
    // 화면 밖까지 끌었다 놓았으면 실제로 그려진(화면 안으로 맞춘) 자리를 기억합니다.
    if (floatingPosRef.current) floatingPosRef.current = { ...renderedPosRef.current };
    if (boxRef.current) delete boxRef.current.dataset.dragging;
  }

  // 형식이 틀린 video_id면 플레이어를 아예 만들지 않습니다 — 만들면 그 뒤 곡들까지
  // 재생이 멈춥니다(useYouTubePlayback의 VIDEO_ID_PATTERN 주석). 오류 처리(다음 곡으로
  // 넘기기/멈춤)는 훅이 handlePlaybackError로 알려줍니다.
  if (!currentTrack || !playback.isVideoIdValid) return null;

  return createPortal(
    <div
      ref={boxRef}
      // z-60: 모달(shared/components/Modal, z-50)의 어두운 배경보다 위 층입니다 — 배경이
      // 영상 앞에 덮이면 YouTube RMF "Overlays and frames" 위반이라서입니다. 대신 모달
      // 카드와는 겹치지 않게 위의 computeTarget이 밀어냅니다.
      className="group fixed top-0 left-0 z-60 h-51.75 w-92"
      style={{ willChange: "transform" }}
    >
      <div
        title="끌어서 옮기기"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        className="absolute inset-x-0 bottom-full mb-1.5 grid h-3.5 cursor-grab touch-none place-items-center rounded-full border border-(--neu-border-80) bg-neu-surface group-data-docked:hidden group-data-dragging:cursor-grabbing"
        style={{ boxShadow: "var(--neu-shadow-tint-pill)" }}
      >
        <div className="h-1 w-9 rounded-full bg-(--neu-ink-63) opacity-60" />
      </div>
      <div
        className="h-full w-full overflow-hidden rounded-[14px] border border-(--neu-border-80) bg-black group-data-dragging:pointer-events-none"
        style={{ boxShadow: "var(--neu-shadow-media-card)" }}
      >
        <PlaybackIframe
          videoId={currentTrack.video_id}
          handlers={playback.iframeHandlers}
        />
      </div>
    </div>,
    document.body,
  );
}
