import {
  mergeToneMappings,
  normalizeToneAlias,
  readStoredStatusSettings,
  readStoredToneMappings,
} from "@/lib/admin/admin-settings";
import { BOARD_ROW_COUNT, type UserTone } from "@/lib/board/board-data";

type GoogleCalendarConfig = {
  almostOverMinutes: number;
  calendarId: string;
  clientId: string;
  clientSecret: string;
  maxResults: number;
  refreshToken: string;
  startingSoonMinutes: number;
  timeZone?: string;
  toneMappings: Map<string, UserTone>;
};

type GoogleCalendarDateValue = {
  date?: string;
  dateTime?: string;
  timeZone?: string;
};

type GoogleCalendarApiEvent = {
  creator?: {
    email?: string;
  };
  end?: GoogleCalendarDateValue;
  id?: string;
  location?: string;
  organizer?: {
    email?: string;
  };
  start?: GoogleCalendarDateValue;
  status?: string;
  summary?: string;
};

export type GoogleCalendarEventRecord = {
  creatorEmail: string;
  end: Date;
  id: string;
  isAllDay: boolean;
  location: string;
  start: Date;
  summary: string;
};

export type CalendarIntegrationSummary = {
  almostOverMinutes: number;
  authMethod: "none" | "oauth_refresh";
  calendarId: string;
  configured: boolean;
  missing: string[];
  rowCount: number;
  startingSoonMinutes: number;
  timeZone?: string;
  toneMappings: Array<{
    identity: string;
    tone: UserTone;
  }>;
};

export type CalendarSharedIdentity = {
  email: string;
  source: "acl" | "event" | "owner";
};

export function getCalendarIntegrationSummary(): CalendarIntegrationSummary {
  const config = readGoogleCalendarConfig();
  const missing = [];

  if (!config.calendarId) {
    missing.push("GOOGLE_CALENDAR_ID");
  }

  if (!config.clientId) {
    missing.push("GOOGLE_CLIENT_ID");
  }

  if (!config.clientSecret) {
    missing.push("GOOGLE_CLIENT_SECRET");
  }

  if (!config.refreshToken) {
    missing.push("GOOGLE_REFRESH_TOKEN");
  }

  return {
    almostOverMinutes: config.almostOverMinutes,
    authMethod: missing.length === 0 ? "oauth_refresh" : "none",
    calendarId: config.calendarId,
    configured: missing.length === 0,
    missing,
    rowCount: BOARD_ROW_COUNT,
    startingSoonMinutes: config.startingSoonMinutes,
    timeZone: config.timeZone,
    toneMappings: [...config.toneMappings.entries()].map(([identity, tone]) => ({
      identity,
      tone: normalizeToneAlias(tone),
    })),
  };
}

export async function listGoogleCalendarEvents(now = new Date()) {
  const config = readGoogleCalendarConfig();
  const summary = getCalendarIntegrationSummary();

  if (!summary.configured) {
    throw new Error(
      `Google Calendar is not configured. Missing: ${summary.missing.join(", ")}`,
    );
  }

  const accessToken = await getAccessToken(config);
  const requestUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events`,
  );

  requestUrl.searchParams.set("fields", "items(id,summary,location,status,start,end,creator/email,organizer/email),timeZone");
  requestUrl.searchParams.set("maxResults", String(config.maxResults));
  requestUrl.searchParams.set("orderBy", "startTime");
  requestUrl.searchParams.set("singleEvents", "true");
  requestUrl.searchParams.set("showDeleted", "false");
  requestUrl.searchParams.set("timeMin", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

  if (config.timeZone) {
    requestUrl.searchParams.set("timeZone", config.timeZone);
  }

  const response = await fetch(requestUrl, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Calendar event fetch failed (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    items?: GoogleCalendarApiEvent[];
    timeZone?: string;
  };
  const storedStatusSettings = await readStoredStatusSettings();
  const storedToneMappings = await readStoredToneMappings();

  return {
    almostOverMinutes: storedStatusSettings.almostOverMinutes,
    events: (payload.items ?? [])
      .filter((event) => event.status !== "cancelled")
      .map(parseGoogleCalendarEvent)
      .filter((event): event is GoogleCalendarEventRecord => event !== null),
    startingSoonMinutes: storedStatusSettings.startingSoonMinutes,
    statusSettings: storedStatusSettings,
    timeZone: config.timeZone ?? payload.timeZone ?? "UTC",
    toneMappings: mergeToneMappings(config.toneMappings, storedToneMappings),
  };
}

export async function listCalendarSharedIdentities() {
  const config = readGoogleCalendarConfig();
  const summary = getCalendarIntegrationSummary();

  if (!summary.configured) {
    throw new Error(
      `Google Calendar is not configured. Missing: ${summary.missing.join(", ")}`,
    );
  }

  const accessToken = await getAccessToken(config);
  const calendarMetadata = await fetchCalendarMetadata(config.calendarId, accessToken);
  const ownerIdentity = calendarMetadata.dataOwner
    ? [
        {
          email: calendarMetadata.dataOwner.trim().toLowerCase(),
          source: "owner" as const,
        },
      ]
    : [];

  try {
    const aclUrl = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/acl`,
    );
    aclUrl.searchParams.set("maxResults", "250");
    aclUrl.searchParams.set("showDeleted", "false");

    const response = await fetch(aclUrl, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Google Calendar ACL fetch failed (${response.status}): ${await response.text()}`,
      );
    }

    const payload = (await response.json()) as {
      items?: Array<{
        role?: string;
        scope?: {
          type?: string;
          value?: string;
        };
      }>;
    };

    const aclIdentities = (payload.items ?? [])
      .filter((entry) => entry.role !== "none")
      .map((entry) => entry.scope)
      .filter((scope) => scope?.type === "user" && Boolean(scope.value))
      .map((scope) => ({
        email: scope?.value?.trim().toLowerCase() ?? "",
        source: "acl" as const,
      }))
      .filter((identity) => Boolean(identity.email));

    return {
      identities: uniqueCalendarIdentities([...ownerIdentity, ...aclIdentities]),
      sourceLabel: "Shared calendar ACL",
    };
  } catch {
    const fallbackCreators = await listRecentCalendarCreatorIdentities();

    return {
      identities: uniqueCalendarIdentities([...ownerIdentity, ...fallbackCreators]),
      issue:
        "Full shared-account discovery needs a refresh token with calendar.acls.readonly or calendar scope. Showing recent event creators instead.",
      sourceLabel: "Recent event creators",
    };
  }
}

function getAccessToken(config: GoogleCalendarConfig) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: config.refreshToken,
  });

  return fetch("https://oauth2.googleapis.com/token", {
    body,
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Google OAuth refresh failed (${response.status}): ${await response.text()}`);
      }

      return response.json() as Promise<{ access_token?: string }>;
    })
    .then((payload) => {
      if (!payload.access_token) {
        throw new Error("Google OAuth refresh did not return an access token.");
      }

      return payload.access_token;
    });
}

function parseGoogleCalendarEvent(event: GoogleCalendarApiEvent): GoogleCalendarEventRecord | null {
  const start = parseGoogleCalendarDateValue(event.start);
  const end = parseGoogleCalendarDateValue(event.end);

  if (!start || !end) {
    return null;
  }

  return {
    creatorEmail: event.creator?.email ?? event.organizer?.email ?? "",
    end,
    id: event.id ?? `${start.toISOString()}-${event.summary ?? "event"}`,
    isAllDay: Boolean(event.start?.date && !event.start?.dateTime),
    location: event.location ?? "",
    start,
    summary: event.summary ?? "",
  };
}

function parseGoogleCalendarDateValue(value?: GoogleCalendarDateValue) {
  if (!value) {
    return null;
  }

  if (value.dateTime) {
    const parsed = new Date(value.dateTime);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value.date) {
    const parsed = new Date(`${value.date}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function parseIntegerEnv(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function listRecentCalendarCreatorIdentities() {
  const eventPayload = await listGoogleCalendarEvents(new Date());

  return uniqueCalendarIdentities(
    eventPayload.events
      .map((event) => event.creatorEmail.trim().toLowerCase())
      .filter(Boolean)
      .map((email) => ({
        email,
        source: "event" as const,
      })),
  );
}

async function fetchCalendarMetadata(calendarId: string, accessToken: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google Calendar metadata fetch failed (${response.status}): ${await response.text()}`,
    );
  }

  return (await response.json()) as {
    dataOwner?: string;
  };
}

function uniqueCalendarIdentities(identities: CalendarSharedIdentity[]) {
  const seen = new Map<string, CalendarSharedIdentity>();

  for (const identity of identities) {
    if (!seen.has(identity.email)) {
      seen.set(identity.email, identity);
    }
  }

  return [...seen.values()].sort((left, right) => left.email.localeCompare(right.email));
}

function parseToneMappings(value: string | undefined) {
  const toneMappings = new Map<string, UserTone>();

  for (const entry of (value ?? "").split(",")) {
    const [identity, tone] = entry.split("=").map((segment) => segment?.trim().toLowerCase());

    if (!identity || !tone || !isUserTone(tone)) {
      continue;
    }

    toneMappings.set(identity, normalizeToneAlias(tone));
  }

  return toneMappings;
}

function readGoogleCalendarConfig(): GoogleCalendarConfig {
  return {
    almostOverMinutes: parseIntegerEnv(process.env.BOARD_ALMOST_OVER_MINUTES, 15),
    calendarId: process.env.GOOGLE_CALENDAR_ID?.trim() ?? "",
    clientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
    maxResults: parseIntegerEnv(process.env.GOOGLE_CALENDAR_MAX_RESULTS, Math.max(BOARD_ROW_COUNT * 6, 24)),
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN?.trim() ?? "",
    startingSoonMinutes: parseIntegerEnv(process.env.BOARD_STARTING_SOON_MINUTES, 30),
    timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE?.trim() || undefined,
    toneMappings: parseToneMappings(process.env.BOARD_USER_TONES),
  };
}

function isUserTone(value: string): value is UserTone {
  return USER_TONE_ALIASES.has(value) || normalizeToneAlias(value) === value;
}

const USER_TONE_ALIASES = new Set(["default", "amber", "sky", "mint", "coral"]);
