export const BOARD_FIELD_WIDTHS = {
  date: 6,
  name: 31,
  start: 5,
  end: 5,
  status: 13,
} as const;

export const BOARD_ROW_COUNT = 7;
export const DEMO_ROW_COUNT = BOARD_ROW_COUNT;

export type UserTone = "default" | "amber" | "sky" | "mint" | "coral";

export type BoardRowData = {
  id: string;
  date: string;
  name: string;
  start: string;
  end: string;
  status: string;
  tone: UserTone;
};

export type BoardSnapshot = {
  rows: BoardRowData[];
};

export type BoardDisplayMode = "demo" | "live";

export type BoardDisplayPayload = {
  generatedAt: string;
  issue?: string;
  mode: BoardDisplayMode;
  pollIntervalMs: number;
  rows: BoardRowData[];
  sourceLabel: string;
  version: string;
};

export function createEmptyRow(slot: number): BoardRowData {
  return {
    id: `empty-${slot}`,
    date: "",
    name: "",
    start: "",
    end: "",
    status: "",
    tone: "default",
  };
}

export function padBoardRows(rows: BoardRowData[], rowCount = BOARD_ROW_COUNT) {
  return Array.from({ length: rowCount }, (_, index) => rows[index] ?? createEmptyRow(index));
}
