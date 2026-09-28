import { useState } from "react";
import { useYouTubePlayback } from "@/features/player/hooks/useYouTubePlayback";

export interface GuestTrack {
  videoId: string;
  title: string;
  channelTitle: string;
}

// 랜딩 페이지 전용 게스트 재생 상태입니다. usePlayerStore(전역 Zustand, 로그인 후
// 대시보드의 큐/재생목록)를 절대 import하지 않는 순수 useState 기반 훅이라, 랜딩에서
// 뭘 재생해도 로그인 사용자의 실제 재생 상태를 오염시키지 않습니다 — LandingPage가
// 마운트될 때 새로 생기고 언마운트되면 그냥 사라집니다.
//
// 상태만 따로일 뿐 YouTube 제어(재생/일시정지 명령, 진행 시간 폴링, 이동, 상태 이벤트,
// 끝난 곡 다시 재생)는 대시보드와 같은 useYouTubePlayback을 쓰고, 표시 상태(재생
// 아이콘/스피너/CD 회전)도 같은 lib/playback-display.ts 셀렉터로 계산합니다 — CD
// 플레이어 동작을 고칠 땐 두 곳이 같이 바뀌어야 합니다.
export function useGuestPlayer() {
  const [track, setTrack] = useState<GuestTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50);
  const [repeat, setRepeat] = useState(false);

  // isPlaying을 여기서 true로 미리 만들지 않습니다 — 영상 로드에 잠깐 걸리는 시간
  // 동안 CD가 먼저 돌아버리는 걸 막기 위해서입니다(usePlayerStore.playQueue와 같은
  // 이유). 실제 true 전환은 YouTube의 PLAYING 이벤트가 맡습니다.
  function playTrack(t: GuestTrack) {
    setTrack(t);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }

  function setProgress(t: number, d: number) {
    setCurrentTime(t);
    setDuration(d);
  }

  // 시안 스펙: 곡이 끝나면 반복이 켜져 있을 때만 처음으로 되돌려 계속 재생하고,
  // 꺼져 있으면 그 자리에서 정지합니다(큐가 없으므로 "다음 곡"이라는 개념 자체가
  // 없습니다 — 대시보드의 loopQueue와는 다른, loopTrack류 단일 반복입니다). 정지한
  // 뒤 다시 재생을 누르면 useYouTubePlayback이 처음부터 재생합니다.
  function handleEnd() {
    if (repeat) {
      setCurrentTime(0);
      playback.replay();
    } else {
      setIsPlaying(false);
    }
  }

  const playback = useYouTubePlayback({
    videoId: track?.videoId,
    isPlaying,
    volume,
    muted: false,
    onPlayingChange: setIsPlaying,
    onVideoPlayingChange: setIsVideoPlaying,
    onProgress: setProgress,
    onEnd: handleEnd,
  });

  // 대시보드의 requestSeek와 같이 화면의 재생 시간도 바로 옮깁니다.
  function seek(time: number) {
    setCurrentTime(time);
    playback.seek(time);
  }

  function setVolume(v: number) {
    setVolumeState(v);
  }

  function toggleRepeat() {
    setRepeat((r) => !r);
  }

  return {
    track,
    isPlaying,
    isVideoPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    playTrack,
    setPlaying: setIsPlaying,
    seek,
    previewTime: setCurrentTime,
    setScrubbing: playback.setScrubbing,
    setVolume,
    toggleRepeat,
    onPlayerReady: playback.handleReady,
    onPlayerStateChange: playback.handleStateChange,
    onPlayerEnd: playback.handleEnd,
  };
}
