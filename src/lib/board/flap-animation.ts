import { BOARD_CHARACTER_ORDER } from "./format-board";

export const FLAP_STEP_INTERVAL_MS = 180;
export const FLAP_STEP_SETTLE_MS = 160;

export function buildVisibleFlipSequence(fromChar: string, toChar: string) {
  const safeFromChar = BOARD_CHARACTER_ORDER.includes(fromChar as never) ? fromChar : " ";
  const safeToChar = BOARD_CHARACTER_ORDER.includes(toChar as never) ? toChar : " ";
  const fromIndex = BOARD_CHARACTER_ORDER.indexOf(
    safeFromChar as (typeof BOARD_CHARACTER_ORDER)[number],
  );
  const toIndex = BOARD_CHARACTER_ORDER.indexOf(
    safeToChar as (typeof BOARD_CHARACTER_ORDER)[number],
  );
  const forwardDistance =
    (toIndex - fromIndex + BOARD_CHARACTER_ORDER.length) % BOARD_CHARACTER_ORDER.length;

  if (forwardDistance === 0) {
    return [];
  }

  return Array.from({ length: forwardDistance }, (_, stepIndex) => {
    const offset = stepIndex + 1;
    const nextIndex = (fromIndex + offset) % BOARD_CHARACTER_ORDER.length;
    return BOARD_CHARACTER_ORDER[nextIndex];
  });
}

export function getVisibleFlipStepCount(fromChar: string, toChar: string) {
  return buildVisibleFlipSequence(fromChar, toChar).length;
}
