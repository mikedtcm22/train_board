"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { demoSnapshots } from "@/lib/board/demo-board-data";
import { BoardShell } from "./board-shell";

const DEMO_ROTATION_MS = 9000;

export function BoardDemo() {
  const [snapshotIndex, setSnapshotIndex] = useState(0);

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

  return (
    <BoardShell
      snapshot={demoSnapshots[snapshotIndex]}
      cycleLabel={`DEMO ${snapshotIndex + 1}/${demoSnapshots.length}`}
    />
  );
}
