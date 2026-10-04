import YouTubeIframe, { type YouTubeProps } from "react-youtube";
import type { PlaybackIframeHandlers } from "../hooks/useYouTubePlayback";

const opts: YouTubeProps["opts"] = {
  width: "100%",
  height: "100%",
  // old-src/src/components/YT.js의 playerVars를 그대로 옮겼습니다.
  playerVars: { autoplay: 1, controls: 0, rel: 0, disablekb: 1 },
};

// 실제 YouTube IFrame. 대시보드(YouTubePlayer — 미니 플레이어/곡 상세 도킹)와 랜딩
// (LandingVideoArea)이 같은 플레이어 설정으로 씁니다. 감싸는 박스(크기·위치·모서리)는
// 자리마다 달라서 호출부가 그리고, 이 컴포넌트는 그 박스를 꽉 채웁니다. 이벤트는
// useYouTubePlayback이 돌려주는 iframeHandlers를 그대로 넘깁니다.
export default function PlaybackIframe({
  videoId,
  handlers,
}: {
  videoId: string;
  handlers: PlaybackIframeHandlers;
}) {
  return (
    <YouTubeIframe
      videoId={videoId}
      opts={opts}
      className="h-full w-full"
      iframeClassName="h-full w-full"
      {...handlers}
    />
  );
}
