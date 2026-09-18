import { createContext } from "react";

// music/:musicId 페이지가 자기 DOM 노드를 등록해두면 YouTubePlayer가 그 노드로
// iframe을 포탈링합니다. 다른 라우트에서는 등록된 노드가 없으므로 YouTubePlayer가
// 자체 오프스크린 컨테이너를 계속 사용해 배경 재생을 유지합니다.
export interface VideoSlotContextValue {
  slotEl: HTMLDivElement | null;
  setSlotEl: (el: HTMLDivElement | null) => void;
}

export const VideoSlotContext = createContext<VideoSlotContextValue | null>(
  null,
);
