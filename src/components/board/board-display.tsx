"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_BOARD_HEADER_MESSAGE,
  DEFAULT_BOARD_HEADER_TONE,
  padBoardRows,
  type BoardDisplayPayload,
} from "@/lib/board/board-data";
import { BoardShell } from "./board-shell";

const CLOCK_UPDATE_MS = 30_000;

type BoardDisplayProps = {
  initialPayload: BoardDisplayPayload;
};

export function BoardDisplay({ initialPayload }: BoardDisplayProps) {
  const [payload, setPayload] = useState(initialPayload);
  const [displayedRows, setDisplayedRows] = useState(() =>
    padBoardRows(initialPayload.rows),
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const payloadRef = useRef(payload);

  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

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
    const refreshBoard = async () => {
      try {
        const response = await fetch("/api/display", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const nextPayload = (await response.json()) as BoardDisplayPayload;
        const currentPayload = payloadRef.current;
        const rowsChanged =
          nextPayload.version !== currentPayload.version ||
          nextPayload.mode !== currentPayload.mode;

        setPayload(nextPayload);

        if (rowsChanged) {
          setDisplayedRows(padBoardRows(nextPayload.rows));
        }
      } catch {
        // Keep rendering the current board state if a poll fails.
      }
    };

    const intervalId = window.setInterval(refreshBoard, payload.pollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [payload.pollIntervalMs]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, CLOCK_UPDATE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const currentDateLabel = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  })
    .format(now)
    .toUpperCase()
    .replace(",", "");

  const currentTimeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
  }).format(now);

  return (
    <BoardShell
      currentDateLabel={currentDateLabel}
      headerMessage={payload.headerMessage || DEFAULT_BOARD_HEADER_MESSAGE}
      headerTone={payload.headerTone ?? DEFAULT_BOARD_HEADER_TONE}
      currentTimeLabel={currentTimeLabel}
      isFullscreen={isFullscreen}
      onFullscreenToggle={toggleFullscreen}
      snapshot={{ rows: displayedRows }}
    />
  );
}
