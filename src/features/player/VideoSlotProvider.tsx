import { useMemo, useState, type ReactNode } from "react";
import {
  VideoSlotContext,
  type VideoSlotContextValue,
} from "./video-slot-context";

export function VideoSlotProvider({ children }: { children: ReactNode }) {
  const [slotEl, setSlotEl] = useState<HTMLDivElement | null>(null);

  const value = useMemo<VideoSlotContextValue>(
    () => ({ slotEl, setSlotEl }),
    [slotEl],
  );

  return (
    <VideoSlotContext.Provider value={value}>
      {children}
    </VideoSlotContext.Provider>
  );
}
