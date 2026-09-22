import { useEffect, useRef, useState } from "react";
import YouTubeIframe, {
  type YouTubeEvent,
  type YouTubePlayer as YouTubePlayerInstance,
} from "react-youtube";

export interface GuestTrack {
  videoId: string;
  title: string;
  channelTitle: string;
}

// 랜딩 페이지 전용 게스트 재생 상태입니다. usePlayerStore(전역 Zustand, 로그인 후
// 대시보드의 큐/재생목록)를 절대 import하지 않는 순수 useState 기반 훅이라, 랜딩에서
// 뭘 재생해도 로그인 사용자의 실제 재생 상태를 오염시키지 않습니다 — LandingPage가
// 마운트될 때 새로 생기고 언마운트되면 그냥 사라집니다.
export function useGuestPlayer() {
  const [track, setTrack] = useState<GuestTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50);
  const [repeat, setRepeat] = useState(false);

  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const prevVideoIdRef = useRef<string | null>(null);

  // isPlaying을 여기서 true로 미리 만들지 않습니다 — 영상 로드에 잠깐 걸리는 시간
  // 동안 CD가 먼저 돌아버리는 걸 막기 위해서입니다(usePlayerStore.playQueue와 같은
  // 이유). 실제 true 전환은 onPlayerStateChange의 PLAYING 이벤트가 맡습니다.
  function playTrack(t: GuestTrack) {
    setTrack(t);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }

  function seek(time: number) {
    setCurrentTime(time);
    const player = playerRef.current;
    if (player) void player.seekTo(time, true);
  }

  function setVolume(v: number) {
    setVolumeState(v);
  }

  function toggleRepeat() {
    setRepeat((r) => !r);
  }

  useEffect(() => {
    const player = playerRef.current;
    const videoId = track?.videoId ?? null;
    const trackChanged = prevVideoIdRef.current !== videoId;
    prevVideoIdRef.current = videoId;
    if (!player || !track) return;
    if (isPlaying) {
      void player.playVideo();
    } else if (!trackChanged) {
      // YouTubePlayer.tsx와 같은 이유 — 트랙이 막 바뀐 시점의 isPlaying:false는
      // "일시정지"가 아니라 "아직 재생 전"이라는 뜻이라 pauseVideo를 부르면 안 됩니다.
      void player.pauseVideo();
    }
  }, [isPlaying, track]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    void player.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!track) return;
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      Promise.all([player.getCurrentTime(), player.getDuration()]).then(
        ([t, d]) => {
          setCurrentTime(t);
          setDuration(d);
        },
      );
    }, 500);
    return () => window.clearInterval(interval);
  }, [track]);

  function onPlayerReady(event: YouTubeEvent) {
    playerRef.current = event.target;
    void event.target.setVolume(volume);
  }

  function onPlayerStateChange(event: YouTubeEvent<number>) {
    if (event.data === YouTubeIframe.PlayerState.PLAYING) setIsPlaying(true);
    if (event.data === YouTubeIframe.PlayerState.PAUSED) setIsPlaying(false);
  }

  // 시안 스펙: 곡이 끝나면 반복이 켜져 있을 때만 처음으로 되돌려 계속 재생하고,
  // 꺼져 있으면 그 자리에서 정지합니다(큐가 없으므로 "다음 곡"이라는 개념 자체가
  // 없습니다 — 대시보드의 loopQueue와는 다른, loopTrack류 단일 반복입니다).
  function onPlayerEnd() {
    const player = playerRef.current;
    if (repeat && player) {
      void player.seekTo(0, true);
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  return {
    track,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    playTrack,
    setPlaying: setIsPlaying,
    seek,
    setVolume,
    toggleRepeat,
    onPlayerReady,
    onPlayerStateChange,
    onPlayerEnd,
  };
}
