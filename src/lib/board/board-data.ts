export const BOARD_FIELD_WIDTHS = {
  date: 6,
  name: 28,
  start: 5,
  end: 5,
  status: 13,
} as const;

export const BOARD_ROW_COUNT = 7;
export const DEMO_ROW_COUNT = BOARD_ROW_COUNT;
export const BOARD_HEADER_WIDTH = 20;
export const BOARD_HEADER_TEXT_MAX_LENGTH = BOARD_HEADER_WIDTH;
export const DEFAULT_BOARD_HEADER_MESSAGE = "FAMILY CALENDAR";

export const USER_TONE_OPTIONS = [
  "yellow",
  "blue",
  "pink",
  "purple",
  "green",
  "red",
  "orange",
  "cyan",
  "lime",
  "white",
] as const;

export type UserTone = (typeof USER_TONE_OPTIONS)[number];

export const DEFAULT_USER_TONE: UserTone = "yellow";

export const USER_TONE_LABELS: Record<UserTone, string> = {
  blue: "Blue",
  cyan: "Cyan",
  green: "Green",
  lime: "Lime",
  orange: "Orange",
  pink: "Pink",
  purple: "Purple",
  red: "Red",
  white: "White",
  yellow: "Yellow",
};

export type StatusTone = UserTone;

export type BoardRowData = {
  id: string;
  date: string;
  name: string;
  start: string;
  end: string;
  status: string;
  statusTone?: StatusTone;
  tone: UserTone;
};

export type BoardSnapshot = {
  rows: BoardRowData[];
};

export type BoardDisplayMode = "demo" | "live";

export type BoardDisplayPayload = {
  generatedAt: string;
  headerMessage: string;
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
    tone: "white",
  };
}

export function padBoardRows(rows: BoardRowData[], rowCount = BOARD_ROW_COUNT) {
  return Array.from({ length: rowCount }, (_, index) => rows[index] ?? createEmptyRow(index));
}
