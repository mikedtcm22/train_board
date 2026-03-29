"use client";

import { useEffect, useState } from "react";
import {
  DEMO_ROW_COUNT,
  demoSnapshots,
  padBoardRows,
} from "@/lib/board/demo-board-data";
import { BoardShell } from "./board-shell";

const DEMO_HOLD_MS = 3800;
const DEMO_ROW_STEP_MS = 740;
const CLOCK_UPDATE_MS = 1000 * 30;

export function BoardDemo() {
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [displayedRows, setDisplayedRows] = useState(() =>
    padBoardRows(demoSnapshots[0].rows),
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const nextSnapshotIndex = (snapshotIndex + 1) % demoSnapshots.length;
    const nextRows = padBoardRows(demoSnapshots[nextSnapshotIndex].rows);
    const timeoutIds: number[] = [];

    timeoutIds.push(
      window.setTimeout(() => {
        for (let rowIndex = 0; rowIndex < DEMO_ROW_COUNT; rowIndex += 1) {
          timeoutIds.push(
            window.setTimeout(() => {
              setDisplayedRows((currentRows) => {
                const updatedRows = [...currentRows];
                updatedRows[rowIndex] = nextRows[rowIndex];
                return updatedRows;
              });
            }, rowIndex * DEMO_ROW_STEP_MS),
          );
        }

        timeoutIds.push(
          window.setTimeout(() => {
            setSnapshotIndex(nextSnapshotIndex);
          }, DEMO_ROW_COUNT * DEMO_ROW_STEP_MS),
        );
      }, DEMO_HOLD_MS),
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [snapshotIndex]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, CLOCK_UPDATE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const currentDateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    weekday: "short",
  })
    .format(now)
    .toUpperCase()
    .replace(",", "");

  const currentTimeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <BoardShell
      currentDateLabel={currentDateLabel}
      currentTimeLabel={currentTimeLabel}
      isFullscreen={isFullscreen}
      onFullscreenToggle={toggleFullscreen}
      snapshot={{ rows: displayedRows }}
    />
  );
}
