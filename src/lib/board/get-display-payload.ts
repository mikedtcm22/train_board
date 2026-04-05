import { listGoogleCalendarEvents } from "@/lib/calendar/google-calendar";
import { buildBoardRowsFromCalendarEvents } from "./live-board-data";
import { createBoardDisplayPayload } from "./display-payload";
import { demoSnapshots } from "./demo-board-data";

const DEMO_POLL_INTERVAL_MS = 3800;
const LIVE_POLL_INTERVAL_MS = 30_000;

export async function getBoardDisplayPayload(now = new Date()) {
  try {
    const liveCalendar = await listGoogleCalendarEvents(now);
    const rows = buildBoardRowsFromCalendarEvents({
      almostOverMinutes: liveCalendar.almostOverMinutes,
      events: liveCalendar.events,
      now,
      startingSoonMinutes: liveCalendar.startingSoonMinutes,
      timeZone: liveCalendar.timeZone,
      toneMappings: liveCalendar.toneMappings,
    });

    return createBoardDisplayPayload({
      mode: "live",
      now,
      pollIntervalMs: LIVE_POLL_INTERVAL_MS,
      rows,
      sourceLabel: "Google Calendar",
    });
  } catch (error) {
    return createBoardDisplayPayload({
      issue: formatIssue(error),
      mode: "demo",
      now,
      pollIntervalMs: DEMO_POLL_INTERVAL_MS,
      rows: getDemoSnapshot(now).rows,
      sourceLabel: "Demo Schedule",
    });
  }
}

function formatIssue(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown board data error.";
}

function getDemoSnapshot(now: Date) {
  const index = Math.floor(now.getTime() / DEMO_POLL_INTERVAL_MS) % demoSnapshots.length;
  return demoSnapshots[index];
}
