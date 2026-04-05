"use client";

import { useEffect, useRef, useState } from "react";
import { BOARD_CHARACTER_ORDER } from "@/lib/board/format-board";
import type { BoardTone } from "./flap-text";
import styles from "./board.module.css";

type FlapCellProps = {
  animated?: boolean;
  char: string;
  delayMs: number;
  tone: BoardTone;
};

const STEP_INTERVAL_MS = 82;
const STEP_SETTLE_MS = 74;

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

    const sequence = buildFlipSequence(startingChar, nextChar);

    sequence.forEach((sequenceChar, stepIndex) => {
      const startAt = delayMs + stepIndex * STEP_INTERVAL_MS;
      const settleAt = startAt + STEP_SETTLE_MS;

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

function buildFlipSequence(fromChar: string, toChar: string) {
  const safeFromChar = BOARD_CHARACTER_ORDER.includes(fromChar as never) ? fromChar : " ";
  const safeToChar = BOARD_CHARACTER_ORDER.includes(toChar as never) ? toChar : " ";
  const fromIndex = BOARD_CHARACTER_ORDER.indexOf(safeFromChar as (typeof BOARD_CHARACTER_ORDER)[number]);
  const toIndex = BOARD_CHARACTER_ORDER.indexOf(safeToChar as (typeof BOARD_CHARACTER_ORDER)[number]);
  const forwardDistance =
    (toIndex - fromIndex + BOARD_CHARACTER_ORDER.length) % BOARD_CHARACTER_ORDER.length;
  const totalSteps = forwardDistance;

  return Array.from({ length: totalSteps }, (_, stepIndex) => {
    const nextIndex = (fromIndex + stepIndex + 1) % BOARD_CHARACTER_ORDER.length;
    return BOARD_CHARACTER_ORDER[nextIndex];
  });
}
