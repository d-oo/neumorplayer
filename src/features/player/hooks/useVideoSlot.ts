import { useContext } from "react";
import { VideoSlotContext } from "./video-slot-context";

export function useVideoSlot() {
  const ctx = useContext(VideoSlotContext);
  if (!ctx)
    throw new Error("useVideoSlot은 VideoSlotProvider 안에서만 사용하세요.");
  return ctx;
}
