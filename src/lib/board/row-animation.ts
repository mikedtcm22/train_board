import type { BoardRowData } from "./board-data";
import { BOARD_FIELD_WIDTHS } from "./board-data";
import { BOARD_CHARACTER_ORDER, formatBoardText } from "./format-board";

const FLAP_STEP_INTERVAL_MS = 82;
const FLAP_STEP_SETTLE_MS = 74;
const ROW_ANIMATION_BUFFER_MS = 180;

const ROW_FIELDS = [
  { key: "date", width: BOARD_FIELD_WIDTHS.date },
  { key: "name", width: BOARD_FIELD_WIDTHS.name },
  { key: "start", width: BOARD_FIELD_WIDTHS.start },
  { key: "end", width: BOARD_FIELD_WIDTHS.end },
  { key: "status", width: BOARD_FIELD_WIDTHS.status },
] as const;

export type RowUpdateStep = {
  delayMs: number;
  rowIndex: number;
};

export function buildRowCascadePlan(currentRows: BoardRowData[], nextRows: BoardRowData[]) {
  const updateSteps: RowUpdateStep[] = [];
  let elapsedMs = 0;

  for (let rowIndex = 0; rowIndex < nextRows.length; rowIndex += 1) {
    const currentRow = currentRows[rowIndex];
    const nextRow = nextRows[rowIndex];

    if (!hasRowChanged(currentRow, nextRow)) {
      continue;
    }

    updateSteps.push({
      delayMs: elapsedMs,
      rowIndex,
    });

    elapsedMs += getRowAnimationDuration(currentRow, nextRow) + ROW_ANIMATION_BUFFER_MS;
  }

  return updateSteps;
}

function hasRowChanged(currentRow?: BoardRowData, nextRow?: BoardRowData) {
  if (!currentRow || !nextRow) {
    return currentRow !== nextRow;
  }

  return (
    currentRow.id !== nextRow.id ||
    currentRow.date !== nextRow.date ||
    currentRow.name !== nextRow.name ||
    currentRow.start !== nextRow.start ||
    currentRow.startMeridiem !== nextRow.startMeridiem ||
    currentRow.end !== nextRow.end ||
    currentRow.endMeridiem !== nextRow.endMeridiem ||
    currentRow.status !== nextRow.status ||
    currentRow.statusTone !== nextRow.statusTone ||
    currentRow.tone !== nextRow.tone
  );
}

function getRowAnimationDuration(currentRow?: BoardRowData, nextRow?: BoardRowData) {
  if (!currentRow || !nextRow) {
    return 0;
  }

  return ROW_FIELDS.reduce((maxDuration, field) => {
    const currentValue = currentRow[field.key];
    const nextValue = nextRow[field.key];

    return Math.max(
      maxDuration,
      getTextAnimationDuration(String(currentValue ?? ""), String(nextValue ?? ""), field.width),
    );
  }, 0);
}

function getTextAnimationDuration(fromValue: string, toValue: string, width: number) {
  const fromChars = [...formatBoardText(fromValue, width)];
  const toChars = [...formatBoardText(toValue, width)];

  return fromChars.reduce((maxDuration, fromChar, index) => {
    const toChar = toChars[index] ?? " ";
    const stepCount = getForwardDistance(fromChar, toChar);

    if (stepCount === 0) {
      return maxDuration;
    }

    return Math.max(
      maxDuration,
      (stepCount - 1) * FLAP_STEP_INTERVAL_MS + FLAP_STEP_SETTLE_MS,
    );
  }, 0);
}

function getForwardDistance(fromChar: string, toChar: string) {
  const safeFromChar = BOARD_CHARACTER_ORDER.includes(fromChar as never) ? fromChar : " ";
  const safeToChar = BOARD_CHARACTER_ORDER.includes(toChar as never) ? toChar : " ";
  const fromIndex = BOARD_CHARACTER_ORDER.indexOf(
    safeFromChar as (typeof BOARD_CHARACTER_ORDER)[number],
  );
  const toIndex = BOARD_CHARACTER_ORDER.indexOf(
    safeToChar as (typeof BOARD_CHARACTER_ORDER)[number],
  );

  return (toIndex - fromIndex + BOARD_CHARACTER_ORDER.length) % BOARD_CHARACTER_ORDER.length;
}
