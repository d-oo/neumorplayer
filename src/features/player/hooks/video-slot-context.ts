import { createContext } from "react";

// music/:musicId 페이지가 재생 중인 트랙을 보여줄 때 자기 DOM 노드를 "앵커"로
// 등록해두면, 화면 전역에 고정된 YouTubePlayer의 실제 iframe 박스가 그 노드의
// getBoundingClientRect() 좌표로 이동해 그 자리에 있는 것처럼 보입니다(포탈 대상을
// 바꾸는 방식이 아니라 위치만 따라가는 방식 — iframe DOM 자체는 한 번도 옮겨지거나
// 제거되지 않으므로 재생이 끊기지 않고, 두 위치 사이를 애니메이션으로 이동할 수
// 있습니다). 등록된 앵커가 없으면 YouTubePlayer는 화면 우측 하단에 떠 있는 미니
// 플레이어 위치를 씁니다.
export interface VideoSlotContextValue {
  anchorEl: HTMLDivElement | null;
  setAnchorEl: (el: HTMLDivElement | null) => void;
}

export const VideoSlotContext = createContext<VideoSlotContextValue | null>(
  null,
);
