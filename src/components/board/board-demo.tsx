"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { demoSnapshots } from "@/lib/board/demo-board-data";
import { BoardShell } from "./board-shell";

const DEMO_ROTATION_MS = 9000;

export function BoardDemo() {
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const advanceDemo = useEffectEvent(() => {
    setSnapshotIndex((current) => (current + 1) % demoSnapshots.length);
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceDemo();
    }, DEMO_ROTATION_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000 * 30);

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
      snapshot={demoSnapshots[snapshotIndex]}
    />
  );
}
