import {
  BOARD_FIELD_WIDTHS,
  DEFAULT_USER_TONE,
  type StatusTone,
} from "./board-data";

export type BoardStatusKey = "" | "startingSoon" | "inProgress" | "almostOver";

export type BoardStatusSettings = {
  almostOverMinutes: number;
  labels: {
    almostOver: string;
    inProgress: string;
    startingSoon: string;
  };
  tones: {
    almostOver: StatusTone;
    inProgress: StatusTone;
    startingSoon: StatusTone;
  };
  startingSoonMinutes: number;
};

type ComputeBoardStatusArgs = {
  almostOverMinutes: number;
  end: Date;
  now: Date;
  start: Date;
  startingSoonMinutes: number;
};

export const DEFAULT_STATUS_SETTINGS: BoardStatusSettings = {
  almostOverMinutes: 15,
  labels: {
    almostOver: "ALMOST OVER",
    inProgress: "IN PROGRESS",
    startingSoon: "STARTING SOON",
  },
  tones: {
    almostOver: "red",
    inProgress: "green",
    startingSoon: DEFAULT_USER_TONE,
  },
  startingSoonMinutes: 30,
};

export const STATUS_TEXT_MAX_LENGTH = BOARD_FIELD_WIDTHS.status;

export function computeBoardStatus({
  almostOverMinutes,
  end,
  now,
  start,
  startingSoonMinutes,
}: ComputeBoardStatusArgs): BoardStatusKey {
  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (nowMs >= endMs) {
    return "";
  }

  if (nowMs >= startMs) {
    if (almostOverMinutes > 0 && endMs - nowMs <= almostOverMinutes * 60_000) {
      return "almostOver";
    }

    return "inProgress";
  }

  if (startingSoonMinutes > 0 && startMs - nowMs <= startingSoonMinutes * 60_000) {
    return "startingSoon";
  }

  return "";
}
