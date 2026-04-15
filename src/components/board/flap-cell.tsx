"use client";

import { useEffect, useRef, useState } from "react";
import { buildVisibleFlipSequence, FLAP_STEP_INTERVAL_MS, FLAP_STEP_SETTLE_MS } from "@/lib/board/flap-animation";
import type { BoardCellSize, BoardTone } from "./flap-text";
import styles from "./board.module.css";

type FlapCellProps = {
  animated?: boolean;
  char: string;
  delayMs: number;
  size: BoardCellSize;
  tone: BoardTone;
};

export function FlapCell({
  animated = true,
  char,
  delayMs,
  size,
  tone,
}: FlapCellProps) {
  const nextChar = char || " ";
  const [currentChar, setCurrentChar] = useState(nextChar);
  const [pendingChar, setPendingChar] = useState(nextChar);
  const [flipping, setFlipping] = useState(false);
  const [activeTone, setActiveTone] = useState(tone);
  const currentCharRef = useRef(nextChar);
  const pendingCharRef = useRef(nextChar);
  const flippingRef = useRef(false);
  const activeToneRef = useRef(tone);
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    timeoutIdsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];

    if (!animated) {
      return;
    }

    const startingChar = flippingRef.current
      ? pendingCharRef.current
      : currentCharRef.current;
    const toneChangeNeeded = tone !== activeToneRef.current;

    if (nextChar === startingChar && !toneChangeNeeded) {
      return;
    }

    if (nextChar === startingChar && toneChangeNeeded) {
      timeoutIdsRef.current.push(
        window.setTimeout(() => {
          activeToneRef.current = tone;
          setActiveTone(tone);
        }, delayMs),
      );

      return;
    }

    const sequence = buildVisibleFlipSequence(startingChar, nextChar);

    sequence.forEach((sequenceChar, stepIndex) => {
      const startAt = delayMs + stepIndex * FLAP_STEP_INTERVAL_MS;
      const settleAt = startAt + FLAP_STEP_SETTLE_MS;

      timeoutIdsRef.current.push(
        window.setTimeout(() => {
          if (stepIndex === 0 && toneChangeNeeded) {
            activeToneRef.current = tone;
            setActiveTone(tone);
          }

          pendingCharRef.current = sequenceChar;
          flippingRef.current = true;
          setPendingChar(sequenceChar);
          setFlipping(true);
        }, startAt),
      );

      timeoutIdsRef.current.push(
        window.setTimeout(() => {
          currentCharRef.current = sequenceChar;
          pendingCharRef.current = sequenceChar;
          flippingRef.current = false;
          setCurrentChar(sequenceChar);
          setPendingChar(sequenceChar);
          setFlipping(false);
        }, settleAt),
      );
    });

    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutIdsRef.current = [];
    };
  }, [animated, delayMs, nextChar, tone]);

  const toneClass = styles[`tone${capitalize(animated ? activeTone : tone)}`];
  const visibleCurrentChar = animated ? currentChar : nextChar;
  const visiblePendingChar = animated ? pendingChar : nextChar;
  const visibleFlipping = animated ? flipping : false;

  return (
    <span
      aria-hidden="true"
      className={`${styles.cell} ${size === "banner" ? styles.cellBanner : ""} ${toneClass} ${visibleFlipping ? styles.cellFlipping : ""}`}
      style={{ ["--flip-delay" as string]: `${delayMs}ms` }}
    >
      <span className={styles.cellTop}>
        <span
          className={`${styles.halfGlyph} ${size === "banner" ? styles.halfGlyphBanner : ""} ${styles.halfGlyphTop}`}
        >
          {visibleCurrentChar}
        </span>
      </span>
      <span className={styles.cellBottom}>
        <span
          className={`${styles.halfGlyph} ${size === "banner" ? styles.halfGlyphBanner : ""} ${styles.halfGlyphBottom}`}
        >
          {visibleFlipping ? visiblePendingChar : visibleCurrentChar}
        </span>
      </span>

      {visibleFlipping ? (
        <>
          <span className={styles.flipTop}>
            <span
              className={`${styles.halfGlyph} ${size === "banner" ? styles.halfGlyphBanner : ""} ${styles.halfGlyphTop}`}
            >
              {visibleCurrentChar}
            </span>
          </span>
          <span className={styles.flipBottom}>
            <span
              className={`${styles.halfGlyph} ${size === "banner" ? styles.halfGlyphBanner : ""} ${styles.halfGlyphBottom}`}
            >
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
