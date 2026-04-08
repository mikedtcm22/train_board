import {
  BOARD_ROW_COUNT,
  type BoardRowData,
  type UserTone,
} from "./board-data";
import { computeBoardStatus } from "./status-rules";

type CalendarToneMappings = Map<string, UserTone>;

export type CalendarEventRecord = {
  creatorEmail: string;
  end: Date;
  id: string;
  isAllDay: boolean;
  location: string;
  start: Date;
  summary: string;
};

type BuildBoardRowsArgs = {
  almostOverMinutes: number;
  events: CalendarEventRecord[];
  now: Date;
  rowCount?: number;
  startingSoonMinutes: number;
  timeZone: string;
  toneMappings: CalendarToneMappings;
};

const FALLBACK_TONE_SEQUENCE: UserTone[] = ["sky", "amber", "coral", "mint"];

export function buildBoardRowsFromCalendarEvents({
  almostOverMinutes,
  events,
  now,
  rowCount = BOARD_ROW_COUNT,
  startingSoonMinutes,
  timeZone,
  toneMappings,
}: BuildBoardRowsArgs): BoardRowData[] {
  return events
    .filter((event) => event.end.getTime() > now.getTime())
    .sort((left, right) => left.start.getTime() - right.start.getTime())
    .slice(0, rowCount)
    .map((event) => {
      const status = computeBoardStatus({
        almostOverMinutes,
        end: event.end,
        now,
        start: event.start,
        startingSoonMinutes,
      });

      return {
        date: formatBoardDate(event.start, timeZone),
        end: event.isAllDay ? "" : formatBoardTime(event.end, timeZone),
        id: event.id,
        name: buildDescription(event.summary),
        start: event.isAllDay ? "ALLDY" : formatBoardTime(event.start, timeZone),
        status,
        tone: resolveUserTone(event.creatorEmail, toneMappings),
      };
    });
}

function buildDescription(summary: string) {
  return summary.trim() || "UNTITLED EVENT";
}

function formatBoardDate(value: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone,
  })
    .format(value)
    .toUpperCase();
}

function formatBoardTime(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
    timeZone,
  }).formatToParts(value);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}

function hashIdentity(identity: string) {
  return [...identity].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function resolveUserTone(identity: string, toneMappings: CalendarToneMappings): UserTone {
  const normalizedIdentity = identity.trim().toLowerCase();

  if (!normalizedIdentity) {
    return "default";
  }

  const mappedTone = toneMappings.get(normalizedIdentity);

  if (mappedTone) {
    return mappedTone;
  }

  const index = hashIdentity(normalizedIdentity) % FALLBACK_TONE_SEQUENCE.length;
  return FALLBACK_TONE_SEQUENCE[index];
}
