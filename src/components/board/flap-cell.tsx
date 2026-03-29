"use client";

import { useEffect, useState } from "react";
import styles from "./board.module.css";

type FlapCellProps = {
  animated?: boolean;
  char: string;
  delayMs: number;
  tone: "default" | "header" | "amber" | "sky" | "mint" | "coral";
};

const FLIP_DURATION_MS = 460;

export function FlapCell({
  animated = true,
  char,
  delayMs,
  tone,
}: FlapCellProps) {
  const nextChar = char || " ";
  const [currentChar, setCurrentChar] = useState(nextChar);
  const [pendingChar, setPendingChar] = useState(nextChar);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (nextChar === currentChar && !flipping) {
      return;
    }

    const kickoffId = window.setTimeout(() => {
      setPendingChar(nextChar);
      setFlipping(true);
    }, 0);

    const settleId = window.setTimeout(() => {
      setCurrentChar(nextChar);
      setPendingChar(nextChar);
      setFlipping(false);
    }, delayMs + FLIP_DURATION_MS);

    return () => {
      window.clearTimeout(kickoffId);
      window.clearTimeout(settleId);
    };
  }, [animated, currentChar, delayMs, flipping, nextChar]);

  const toneClass = styles[`tone${capitalize(tone)}`];
  const visibleCurrentChar = animated ? currentChar : nextChar;
  const visiblePendingChar = animated ? pendingChar : nextChar;
  const visibleFlipping = animated ? flipping : false;

  return (
    <span
      aria-hidden="true"
      className={`${styles.cell} ${toneClass} ${visibleFlipping ? styles.cellFlipping : ""}`}
      style={{ ["--flip-delay" as string]: `${delayMs}ms` }}
    >
      <span className={styles.cellTop}>
        <span className={`${styles.halfGlyph} ${styles.halfGlyphTop}`}>
          {visibleCurrentChar}
        </span>
      </span>
      <span className={styles.cellBottom}>
        <span className={`${styles.halfGlyph} ${styles.halfGlyphBottom}`}>
          {visibleFlipping ? visiblePendingChar : visibleCurrentChar}
        </span>
      </span>

      {visibleFlipping ? (
        <>
          <span className={styles.flipTop}>
            <span className={`${styles.halfGlyph} ${styles.halfGlyphTop}`}>
              {visibleCurrentChar}
            </span>
          </span>
          <span className={styles.flipBottom}>
            <span className={`${styles.halfGlyph} ${styles.halfGlyphBottom}`}>
              {visiblePendingChar}
            </span>
          </span>
        </>
      ) : null}
    </span>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
