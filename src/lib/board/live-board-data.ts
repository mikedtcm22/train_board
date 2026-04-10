import {
  BOARD_ROW_COUNT,
  DEFAULT_USER_TONE,
  type MeridiemIndicator,
  type BoardRowData,
  type UserTone,
} from "./board-data";
import {
  computeBoardStatus,
  type BoardStatusSettings,
} from "./status-rules";

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
  statusSettings: BoardStatusSettings;
  timeZone: string;
  toneMappings: CalendarToneMappings;
};

export function buildBoardRowsFromCalendarEvents({
  almostOverMinutes,
  events,
  now,
  rowCount = BOARD_ROW_COUNT,
  statusSettings,
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
        startingSoonMinutes: statusSettings.startingSoonMinutes,
      });
      const timeDisplay = buildEventTimeDisplay(event, now, timeZone);

      return {
        date: timeDisplay.date,
        end: timeDisplay.end,
        endMeridiem: timeDisplay.endMeridiem,
        id: event.id,
        name: buildDescription(event.summary),
        start: timeDisplay.start,
        startMeridiem: timeDisplay.startMeridiem,
        status: status ? statusSettings.labels[status] : "",
        statusTone: status ? statusSettings.tones[status] : undefined,
        tone: resolveUserTone(event.creatorEmail, toneMappings),
      };
    });
}

function buildDescription(summary: string) {
  return summary.trim() || "UNTITLED EVENT";
}

function buildEventTimeDisplay(
  event: CalendarEventRecord,
  now: Date,
  timeZone: string,
) {
  const startDayKey = getLocalDateKey(event.start, timeZone);
  const endDisplayDate = getDisplayEndDate(event);
  const endDayKey = getLocalDateKey(endDisplayDate, timeZone);
  const currentDayKey = getCurrentDisplayDayKey({
    endDayKey,
    now,
    startDayKey,
    timeZone,
  });
  const spansMultipleDays = startDayKey !== endDayKey;

  if (!spansMultipleDays) {
    return {
      date: formatBoardDate(event.start, timeZone),
      end: event.isAllDay ? "" : formatBoardTime(event.end, timeZone).label,
      endMeridiem: event.isAllDay ? undefined : formatBoardTime(event.end, timeZone).meridiem,
      start: event.isAllDay ? "ALLDY" : formatBoardTime(event.start, timeZone).label,
      startMeridiem: event.isAllDay
        ? undefined
        : formatBoardTime(event.start, timeZone).meridiem,
    };
  }

  const startTime = event.isAllDay ? null : formatBoardTime(event.start, timeZone);
  const endTime = event.isAllDay ? null : formatBoardTime(event.end, timeZone);

  return {
    date: formatBoardDate(parseLocalDateKey(currentDayKey, event.start, timeZone), timeZone),
    end:
      currentDayKey === endDayKey && endTime
        ? endTime.label
        : formatCompactBoardDate(endDisplayDate, timeZone),
    endMeridiem:
      currentDayKey === endDayKey && endTime ? endTime.meridiem : undefined,
    start:
      currentDayKey === startDayKey && startTime
        ? startTime.label
        : formatCompactBoardDate(event.start, timeZone),
    startMeridiem:
      currentDayKey === startDayKey && startTime ? startTime.meridiem : undefined,
  };
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

function formatCompactBoardDate(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone,
  }).formatToParts(value);
  const month = parts.find((part) => part.type === "month")?.value ?? "UNK";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${month.toUpperCase()}${day}`;
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
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value?.toLowerCase();

  return {
    label: `${hour}:${minute}`,
    meridiem: dayPeriod === "am" || dayPeriod === "pm" ? dayPeriod : undefined,
  } satisfies {
    label: string;
    meridiem?: MeridiemIndicator;
  };
}

function getCurrentDisplayDayKey({
  endDayKey,
  now,
  startDayKey,
  timeZone,
}: {
  endDayKey: string;
  now: Date;
  startDayKey: string;
  timeZone: string;
}) {
  const todayKey = getLocalDateKey(now, timeZone);

  if (todayKey <= startDayKey) {
    return startDayKey;
  }

  if (todayKey >= endDayKey) {
    return endDayKey;
  }

  return todayKey;
}

function getDisplayEndDate(event: CalendarEventRecord) {
  return event.isAllDay ? new Date(event.end.getTime() - 1) : event.end;
}

function getLocalDateKey(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(dateKey: string, fallback: Date, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map((segment) => Number.parseInt(segment, 10));

  if (!year || !month || !day) {
    return fallback;
  }

  const approximateUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const formatted = getLocalDateKey(approximateUtc, timeZone);

  if (formatted === dateKey) {
    return approximateUtc;
  }

  return fallback;
}

function resolveUserTone(identity: string, toneMappings: CalendarToneMappings): UserTone {
  const normalizedIdentity = identity.trim().toLowerCase();

  if (!normalizedIdentity) {
    return DEFAULT_USER_TONE;
  }

  const mappedTone = toneMappings.get(normalizedIdentity);

  if (mappedTone) {
    return mappedTone;
  }

  return DEFAULT_USER_TONE;
}
