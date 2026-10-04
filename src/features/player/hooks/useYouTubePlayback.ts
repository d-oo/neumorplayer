import { useCallback, useEffect, useRef } from "react";
import YouTubeIframe, {
  type YouTubeEvent,
  type YouTubePlayer as YouTubePlayerInstance,
} from "react-youtube";

// 이동(seekTo) 직후 이 시간 동안은 폴링으로 받아온 재생 시간을 무시합니다 — YouTube가
// 이동을 처리하는 중엔 아직 이동 전 시간을 돌려줄 수 있어서, 그대로 쓰면 재생바가
// 방금 옮긴 자리에서 잠깐 뒤로 튀었다가 돌아옵니다.
const SEEK_SETTLE_MS = 600;
const PROGRESS_POLL_MS = 500;

// YouTube 영상 ID 형식(영문·숫자·-·_ 11자). 형식이 틀린 ID(예: 12자)는 YouTube IFrame
// API가 플레이어를 만드는 순간 "Invalid video id" 예외를 던지고 onReady도 onError도
// 보내지 않습니다(직접 실험으로 확인). 그러면 react-youtube 안의 youtube-player가
// destroy()를 포함한 모든 명령을 ready 뒤로 미뤄 둔 채 영원히 기다리고, react-youtube는
// 옛 플레이어의 destroy가 끝나야 새 플레이어를 만들기 때문에 다음 곡부터는 새로고침
// 전까지 아무것도 재생되지 않습니다(실제로 겪음). 그래서 형식이 틀린 ID는 <YouTubeIframe>
// 에 넘기지 않고(호출부가 isVideoIdValid로 렌더를 막음) 곧바로 재생 오류로 처리합니다.
// 앱에서 추가한 곡의 video_id는 항상 YouTube API가 준 값이라, DB를 직접 고친 경우에만
// 생기는 방어입니다. 형식은 맞지만 없는 영상은 YouTube가 onError(150 등)를 보냅니다.
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
// IFrame API onError의 "잘못된 매개변수"(11자가 아닌 ID 등) 코드.
const INVALID_PARAM_ERROR_CODE = 2;

// <YouTubeIframe>(PlaybackIframe)에 그대로 넘기는 이벤트 핸들러 묶음.
export interface PlaybackIframeHandlers {
  onReady: (event: YouTubeEvent) => void;
  onStateChange: (event: YouTubeEvent<number>) => void;
  onEnd: () => void;
  onError: (event: YouTubeEvent<number>) => void;
}

interface UseYouTubePlaybackOptions {
  // 지금 <YouTubeIframe videoId>에 넘기는 값과 반드시 같은 videoId. react-youtube는
  // videoId가 바뀌면 기존 플레이어를 파괴하고 새로 만들기 때문에(shouldResetPlayer),
  // 이 값이 바뀌는 순간 옛 플레이어로는 아무 명령도 보내지 않습니다.
  videoId: string | undefined;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  // YouTube가 PLAYING/PAUSED를 알려왔을 때 재생 의도(isPlaying)를 맞춥니다.
  onPlayingChange: (playing: boolean) => void;
  // YouTube가 알려온 상태가 PLAYING인지(selectIsAudible/selectIsLoading의 재료).
  onVideoPlayingChange: (playing: boolean) => void;
  onProgress: (currentTime: number, duration: number) => void;
  // 영상이 끝까지 재생됐을 때(다음 곡/반복/정지는 호출부가 정함).
  onEnd: () => void;
  // YouTube가 재생 오류를 알려왔을 때(삭제·비공개 영상 100, 퍼가기 금지 101/150 등 —
  // 코드는 IFrame API의 onError 문서 참고). 이 영상은 더 재생할 수 없으니 다음 곡으로
  // 넘길지 멈출지는 호출부가 정합니다. 호출부마다 반드시 처리하도록 필수로 둡니다.
  onError: (code: number) => void;
}

// 플레이어 명령은 전부 이걸 거칩니다. YouTube IFrame API는 이미 파괴된 플레이어에
// 명령을 보내면 동기적으로 TypeError(… reading 'src')를 던지는데, 그게 effect 안이면
// React가 앱 전체를 내려 흰 화면이 됐습니다(실제로 겪음). 원인(파괴된 플레이어를
// 가리키는 playerRef)은 곡 전환 처리에서 막고, 여기는 혹시 남은 경우에도 재생 명령
// 하나 실패로 앱이 통째로 죽지 않게 하는 마지막 방어선입니다.
function safely(run: () => unknown) {
  try {
    const result = run();
    if (result instanceof Promise) {
      result.catch((error: unknown) =>
        console.warn("YouTube 플레이어 명령 실패", error),
      );
    }
  } catch (error) {
    console.warn("YouTube 플레이어 명령 실패", error);
  }
}

// 대시보드(YouTubePlayer.tsx + usePlayerStore)와 랜딩(useGuestPlayer)이 함께 쓰는
// "YouTube IFrame 제어" 로직입니다. 재생 상태의 소유자는 서로 다르게 두되(랜딩은
// 로그인 사용자의 usePlayerStore를 절대 건드리면 안 됨), 원래 두 곳에 거의 같은
// 코드가 복사되어 있어서 한쪽만 고쳐지는 일이 생겼습니다(실제로 겪음) — 재생/일시정지
// 명령, 볼륨, 진행 시간 폴링, 이동, 상태 이벤트, 끝남 처리는 전부 여기서만 고칩니다.
// 이 훅도 어떤 전역 스토어도 알지 못하고 값/콜백만 주입받습니다(useCdPlayerPhysics와
// 같은 방식).
//
// 시간 이동은 old-src(Player.js의 Slider)와 같은 원칙입니다: 재생바 드래그/CD 스크럽
// 도중엔 화면 표시만 바뀌고 YouTube에는 아무것도 보내지 않으며, 손을 놓을 때 seekTo를
// 한 번만 보냅니다(useCdPlayerPhysics). 드래그 중에 영상을 멈추거나 재개하지도
// 않습니다 — 재생 중의 seekTo는 재생을 그대로 이어가고, 끝 위치로 보내면 YouTube가
// 알아서 ENDED를 보냅니다. 예전엔 드래그 중에 이동 요청을 여러 번 보내고 일시정지했다가
// 놓을 때 재개했는데, 곡 끝까지 빠르게 끌고 놓으면 YouTube의 비동기 ENDED보다 재개
// 명령이 먼저 가서 곡이 처음부터 다시 재생됐습니다(실제로 겪음).
//
// 곡 끝 근처로의 이동에 대한 YouTube의 동작(IFrame API로 직접 실험해 확인)과, 그걸
// old-src처럼 받아내는 방법:
// - 실제 길이 이상으로 seekTo → 이동하지 않고 제자리에서 ENDED. 이때 getCurrentTime()은
//   이동 전 위치를 돌려줍니다. 재생바를 끝까지 빠르게 끌면 위치가 정확히 duration이
//   되는데, getDuration()이 반올림된 값(실제보다 큼)을 줄 때가 있어 이렇게 됩니다.
//   → "끝까지 끌었더니 곡이 끝남"이라 결과 자체는 맞습니다. 다만 끝난 뒤 폴링이 그
//   이동 전 위치를 받아와 재생바가 되돌아가 보였으므로, ENDED를 받으면 재생바를 끝에
//   두고 끝난 동안엔 폴링 값을 반영하지 않습니다(old-src는 재생 중에만 시간을
//   갱신해서 이 문제가 드러나지 않았음).
// - 실제 끝 1초 이내로 seekTo → 가짜 ENDED가 한 번 온 뒤 YouTube가 스스로 PLAYING으로
//   돌아가 나머지를 재생합니다. → PLAYING을 받으면 "끝났음"을 지웁니다. 안 그러면
//   "끝난 곡에서 재생을 누르면 0초부터"(아래 effect)가 YouTube의 자체 재개에도 발동해
//   곡이 처음으로 되감겼습니다(old-src엔 0초로 되감는 코드 자체가 없었음).
export function useYouTubePlayback({
  videoId,
  isPlaying,
  volume,
  muted,
  onPlayingChange,
  onVideoPlayingChange,
  onProgress,
  onEnd,
  onError,
}: UseYouTubePlaybackOptions) {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const prevVideoIdRef = useRef<string | undefined>(undefined);
  // 지금 영상이 끝까지 재생되어 ENDED 상태로 멈춰 있는지. 곡이 끝나 isPlaying이
  // false로 내려가는 걸 아래 effect가 "사용자가 일시정지를 누름"으로 오해해 끝난 영상에
  // pauseVideo를 보내면, 다시 재생을 눌렀을 때 0초로만 돌아가고 멈춰 버렸습니다(실제로
  // 겪음). 그래서 끝난 영상에는 pauseVideo를 보내지 않고, 다시 재생할 때는 0초로
  // 명시적으로 옮긴 뒤 재생합니다.
  const endedRef = useRef(false);
  const lastSeekAtRef = useRef(0);
  // 폴링으로 받아온 곡 길이 — ENDED를 받았을 때 재생바를 끝에 두는 데 씁니다.
  const durationRef = useRef(0);
  // 재생바 드래그/CD 스크럽 중인지 — 그동안은 폴링 값으로 화면 표시(손 위치)를 덮어쓰지
  // 않습니다.
  const isScrubbingRef = useRef(false);

  // 폴링 interval(롱리빙 클로저)이 최신 값을 읽도록 동기화하는 ref.
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // 아래 "형식이 틀린 ID" effect가 videoId가 바뀔 때만 돌도록 콜백은 ref로 읽습니다.
  const onErrorRef = useRef(onError);
  const onVideoPlayingChangeRef = useRef(onVideoPlayingChange);
  useEffect(() => {
    onErrorRef.current = onError;
    onVideoPlayingChangeRef.current = onVideoPlayingChange;
  }, [onError, onVideoPlayingChange]);

  const isVideoIdValid =
    videoId === undefined || VIDEO_ID_PATTERN.test(videoId);

  // 형식이 틀린 ID로 바뀌면 YouTube 오류가 온 것처럼 호출부에 알립니다(파일 위
  // VIDEO_ID_PATTERN 주석 참고).
  useEffect(() => {
    if (videoId === undefined || VIDEO_ID_PATTERN.test(videoId)) return;
    onVideoPlayingChangeRef.current(false);
    onErrorRef.current(INVALID_PARAM_ERROR_CODE);
  }, [videoId]);

  useEffect(() => {
    const trackChanged = prevVideoIdRef.current !== videoId;
    prevVideoIdRef.current = videoId;
    if (trackChanged) {
      endedRef.current = false;
      durationRef.current = 0;
      // react-youtube가 옛 플레이어를 파괴하는 중이라 새 플레이어의 onReady가 올
      // 때까지는 명령을 보낼 대상이 없습니다(자동재생은 playerVars.autoplay가 맡음).
      // 이걸 비우지 않으면 곡이 바뀐 직후의 playVideo/seekTo(예: 재생목록에서 CD로 곡
      // 끝까지 스크럽 → 다음 곡으로 넘어간 뒤에도 이어지는 이동 요청)가 파괴된
      // 플레이어로 가서 흰 화면이 됐습니다.
      playerRef.current = null;
      return;
    }
    const player = playerRef.current;
    if (!player || !videoId) return;
    if (isPlaying) {
      if (endedRef.current) {
        endedRef.current = false;
        safely(() => player.seekTo(0, true));
      }
      safely(() => player.playVideo());
    } else if (!endedRef.current) {
      // 곡이 바뀌는 시점의 isPlaying:false는 "아직 실제 재생 전"이라는 뜻이지
      // "일시정지하라"는 뜻이 아닙니다(usePlayerStore.playQueue/jumpTo, useGuestPlayer
      // .playTrack 참고) — 여기서 pauseVideo를 부르면 막 자동재생을 시작한 영상을 바로
      // 멈춰버립니다. 같은 곡에서 사용자가 실제로 일시정지를 눌렀을 때만 멈춥니다
      // (곡이 바뀐 경우는 위에서 이미 return).
      safely(() => player.pauseVideo());
    }
  }, [isPlaying, videoId]);

  // 볼륨이 바뀌면 setVolume만 보냅니다. 음소거 중에 보내도 음소거는 풀리지 않습니다
  // (IFrame API로 직접 실험해 확인).
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
    const player = playerRef.current;
    if (!player) return;
    safely(() => player.setVolume(volume));
  }, [volume]);

  // mute()/unMute()는 음소거 상태가 실제로 바뀔 때만 보냅니다. YouTube의 unMute()는
  // 볼륨이 5보다 낮으면 5로 끌어올려서(직접 실험해 확인 — 예전엔 볼륨이 바뀔 때마다
  // setVolume 뒤에 unMute()를 불러 0%인데도 5%로 소리가 났음), 음소거를 푼 직후엔 지금
  // 볼륨을 다시 넣어 0~4%를 지킵니다.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) {
      safely(() => player.mute());
    } else {
      safely(() => player.unMute());
      safely(() => player.setVolume(volumeRef.current));
    }
  }, [muted]);

  useEffect(() => {
    if (!videoId) return;
    // playerRef는 onReady에서 채워지고 곡이 바뀌면 교체되므로 매 tick마다 다시 읽습니다.
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      Promise.all([player.getCurrentTime(), player.getDuration()])
        .then(([currentTime, duration]) => {
          if (playerRef.current === player) durationRef.current = duration;
          // 드래그/스크럽 중이거나 방금 이동한 직후엔 화면 값(손 위치)이 우선입니다.
          // 응답이 비동기라 요청 시점이 아니라 도착 시점에 확인합니다. 그사이 곡이
          // 바뀌어 플레이어가 교체됐다면 옛 곡의 시간이니 버립니다.
          // 끝난 동안엔 getCurrentTime()이 이동 전 위치를 돌려줄 수 있어 반영하지
          // 않습니다(재생바는 handleEnd가 끝에 둠 — 훅 위 주석 참고).
          if (
            playerRef.current !== player ||
            isScrubbingRef.current ||
            endedRef.current ||
            performance.now() - lastSeekAtRef.current < SEEK_SETTLE_MS
          ) {
            return;
          }
          onProgressRef.current(currentTime, duration);
        })
        .catch(() => {
          // 파괴 중인 플레이어에 물어본 경우 — 다음 tick(새 플레이어)에서 다시 받습니다.
        });
    }, PROGRESS_POLL_MS);
    return () => window.clearInterval(interval);
  }, [videoId]);

  // 손을 놓을 때 한 번 불립니다. 호출부는 화면의 재생 시간도 같이 옮겨야 합니다(이
  // 함수는 YouTube 쪽만 담당). old-src처럼 재생 상태는 건드리지 않습니다 — 재생 중이면
  // 그 위치부터 이어서, 일시정지 중이면 멈춘 채로 이동합니다. 끝난(ENDED) 곡에 보내면
  // YouTube가 그 위치부터 재생을 시작합니다(seekTo의 문서화된 동작, old-src도 동일).
  const seek = useCallback((time: number) => {
    endedRef.current = false;
    lastSeekAtRef.current = performance.now();
    const player = playerRef.current;
    if (player) safely(() => player.seekTo(time, true));
  }, []);

  // 재생바 드래그/CD 스크럽의 시작·끝(useCdPlayerPhysics의 onScrubbingChange에서 옴).
  // 그동안 폴링 값을 무시하기만 합니다 — 영상은 멈추지 않습니다(훅 위 주석 참고).
  const setScrubbing = useCallback((scrubbing: boolean) => {
    isScrubbingRef.current = scrubbing;
  }, []);

  // 곡이 끝났을 때 처음부터 다시 재생(랜딩의 한 곡 반복).
  const replay = useCallback(() => {
    endedRef.current = false;
    lastSeekAtRef.current = performance.now();
    const player = playerRef.current;
    if (!player) return;
    safely(() => player.seekTo(0, true));
    safely(() => player.playVideo());
  }, []);

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    // 새 플레이어는 음소거가 아닌 상태로 시작하므로 음소거 중일 때만 mute()를 보냅니다
    // (unMute()를 부르지 않으니 0~4% 볼륨이 5%로 올라가지 않음 — 위 음소거 effect 참고).
    if (muted) safely(() => event.target.mute());
    safely(() => event.target.setVolume(volume));
  };

  const handleStateChange = (event: YouTubeEvent<number>) => {
    if (event.data === YouTubeIframe.PlayerState.PLAYING) {
      // YouTube가 재생 중이라면 끝난 게 아닙니다(끝 근처 이동 직후의 가짜 ENDED 뒤
      // 자체 재개 — 훅 위 주석 참고). onPlayingChange보다 먼저 지워야 재생 effect가
      // 0초로 되감지 않습니다.
      endedRef.current = false;
      onPlayingChange(true);
    }
    if (event.data === YouTubeIframe.PlayerState.PAUSED) onPlayingChange(false);
    // PLAYING일 때만 "실제로 재생 중" — 버퍼링·일시정지·끝남·로드 전은 전부 아님.
    onVideoPlayingChange(event.data === YouTubeIframe.PlayerState.PLAYING);
  };

  const handleEnd = () => {
    endedRef.current = true;
    // 재생바를 끝에 둡니다(끝난 뒤의 getCurrentTime()은 믿을 수 없음).
    const dur = durationRef.current;
    if (dur > 0) onProgressRef.current(dur, dur);
    onEnd();
  };

  // 오류가 난 영상은 PLAYING이 오지 않으므로 "실제 재생 중" 표시를 확실히 내린 뒤
  // 호출부에 넘깁니다.
  const handleError = (event: YouTubeEvent<number>) => {
    onVideoPlayingChange(false);
    onError(event.data);
  };

  return {
    // false면 호출부는 <YouTubeIframe>을 렌더링하지 않아야 합니다.
    isVideoIdValid,
    seek,
    setScrubbing,
    replay,
    iframeHandlers: {
      onReady: handleReady,
      onStateChange: handleStateChange,
      onEnd: handleEnd,
      onError: handleError,
    } satisfies PlaybackIframeHandlers,
  };
}
