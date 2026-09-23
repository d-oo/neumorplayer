import { useMemo, useState, type ReactNode } from "react";
import {
  VideoSlotContext,
  type VideoSlotContextValue,
} from "./hooks/video-slot-context";

export function VideoSlotProvider({ children }: { children: ReactNode }) {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const value = useMemo<VideoSlotContextValue>(
    () => ({ anchorEl, setAnchorEl }),
    [anchorEl],
  );

  return (
    <VideoSlotContext.Provider value={value}>
      {children}
    </VideoSlotContext.Provider>
  );
}
