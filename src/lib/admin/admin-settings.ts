import { promises as fs } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";
import {
  BOARD_HEADER_TEXT_MAX_LENGTH,
  DEFAULT_BOARD_HEADER_MESSAGE,
  DEFAULT_USER_TONE,
  USER_TONE_OPTIONS,
  type UserTone,
} from "@/lib/board/board-data";
import { formatBoardText } from "@/lib/board/format-board";
import {
  DEFAULT_STATUS_SETTINGS,
  STATUS_TEXT_MAX_LENGTH,
  type BoardStatusSettings,
} from "@/lib/board/status-rules";

type AdminSettingsFile = {
  headerMessage?: string;
  statusSettings?: {
    almostOverMinutes?: number;
    labels?: Partial<BoardStatusSettings["labels"]>;
    startingSoonMinutes?: number;
    tones?: Partial<BoardStatusSettings["tones"]>;
  };
  toneMappings?: Record<string, UserTone>;
};

const SETTINGS_DIRECTORY = path.join(process.cwd(), ".local");
const SETTINGS_PATH = path.join(SETTINGS_DIRECTORY, "admin-settings.json");
const SETTINGS_BLOB_PATH = "admin/admin-settings.json";

export async function readAdminSettings() {
  if (hasBlobStorage()) {
    return readBlobBackedSettings();
  }

  try {
    const fileContents = await fs.readFile(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(fileContents) as AdminSettingsFile;

    return {
      headerMessage: normalizeHeaderMessage(parsed.headerMessage),
      statusSettings: normalizeStatusSettings(parsed.statusSettings),
      toneMappings: normalizeToneMappings(parsed.toneMappings ?? {}),
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        headerMessage: DEFAULT_BOARD_HEADER_MESSAGE,
        statusSettings: DEFAULT_STATUS_SETTINGS,
        toneMappings: new Map<string, UserTone>(),
      };
    }

    throw error;
  }
}

export async function readStoredToneMappings() {
  const settings = await readAdminSettings();
  return settings.toneMappings;
}

export async function readStoredHeaderMessage() {
  const settings = await readAdminSettings();
  return settings.headerMessage;
}

export async function readStoredStatusSettings() {
  const settings = await readAdminSettings();
  return settings.statusSettings;
}

export async function writeStoredToneMappings(
  mappings: Array<{ identity: string; tone: UserTone }>,
) {
  const currentSettings = await readAdminSettings();
  const normalizedMappings = normalizeToneMappings(
    Object.fromEntries(mappings.map(({ identity, tone }) => [identity, tone])),
  );

  const nextSettings = {
    headerMessage: currentSettings.headerMessage,
    statusSettings: currentSettings.statusSettings,
    toneMappings: Object.fromEntries(normalizedMappings),
  };

  if (hasBlobStorage()) {
    await writeBlobBackedSettings(nextSettings);
    return;
  }

  await fs.mkdir(SETTINGS_DIRECTORY, { recursive: true });
  await fs.writeFile(
    SETTINGS_PATH,
    JSON.stringify(nextSettings, null, 2),
    "utf8",
  );
}

export async function writeStoredStatusSettings(statusSettings: BoardStatusSettings) {
  const currentSettings = await readAdminSettings();

  const nextSettings = {
    headerMessage: currentSettings.headerMessage,
    statusSettings: normalizeStatusSettings(statusSettings),
    toneMappings: Object.fromEntries(currentSettings.toneMappings),
  };

  if (hasBlobStorage()) {
    await writeBlobBackedSettings(nextSettings);
    return;
  }

  await fs.mkdir(SETTINGS_DIRECTORY, { recursive: true });
  await fs.writeFile(
    SETTINGS_PATH,
    JSON.stringify(nextSettings, null, 2),
    "utf8",
  );
}

export async function writeStoredHeaderMessage(headerMessage: string) {
  const currentSettings = await readAdminSettings();

  const nextSettings = {
    headerMessage: normalizeHeaderMessage(headerMessage),
    statusSettings: currentSettings.statusSettings,
    toneMappings: Object.fromEntries(currentSettings.toneMappings),
  };

  if (hasBlobStorage()) {
    await writeBlobBackedSettings(nextSettings);
    return;
  }

  await fs.mkdir(SETTINGS_DIRECTORY, { recursive: true });
  await fs.writeFile(
    SETTINGS_PATH,
    JSON.stringify(nextSettings, null, 2),
    "utf8",
  );
}

export function mergeToneMappings(
  baseMappings: Map<string, UserTone>,
  overrideMappings: Map<string, UserTone>,
) {
  return new Map<string, UserTone>([
    ...baseMappings.entries(),
    ...overrideMappings.entries(),
  ]);
}

export function normalizeToneAlias(value: string): UserTone {
  if (value === "amber") {
    return "yellow";
  }

  if (value === "sky") {
    return "blue";
  }

  if (value === "mint") {
    return "green";
  }

  if (value === "coral") {
    return "pink";
  }

  if (value === "default") {
    return "white";
  }

  if (USER_TONE_OPTIONS.includes(value as UserTone)) {
    return value as UserTone;
  }

  return DEFAULT_USER_TONE;
}

function isMissingFileError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function normalizeToneMappings(mappings: Record<string, UserTone>) {
  const normalizedMappings = new Map<string, UserTone>();

  for (const [identity, tone] of Object.entries(mappings)) {
    const normalizedIdentity = identity.trim().toLowerCase();

    if (!normalizedIdentity) {
      continue;
    }

    normalizedMappings.set(normalizedIdentity, normalizeToneAlias(tone));
  }

  return normalizedMappings;
}

function normalizeStatusSettings(
  statusSettings?: AdminSettingsFile["statusSettings"] | BoardStatusSettings,
): BoardStatusSettings {
  return {
    almostOverMinutes: normalizeMinutes(
      statusSettings?.almostOverMinutes,
      DEFAULT_STATUS_SETTINGS.almostOverMinutes,
    ),
    labels: {
      almostOver: normalizeStatusLabel(
        statusSettings?.labels?.almostOver,
        DEFAULT_STATUS_SETTINGS.labels.almostOver,
      ),
      inProgress: normalizeStatusLabel(
        statusSettings?.labels?.inProgress,
        DEFAULT_STATUS_SETTINGS.labels.inProgress,
      ),
      startingSoon: normalizeStatusLabel(
        statusSettings?.labels?.startingSoon,
        DEFAULT_STATUS_SETTINGS.labels.startingSoon,
      ),
    },
    tones: {
      almostOver: normalizeToneAlias(
        statusSettings?.tones?.almostOver ?? DEFAULT_STATUS_SETTINGS.tones.almostOver,
      ),
      inProgress: normalizeToneAlias(
        statusSettings?.tones?.inProgress ?? DEFAULT_STATUS_SETTINGS.tones.inProgress,
      ),
      startingSoon: normalizeToneAlias(
        statusSettings?.tones?.startingSoon ?? DEFAULT_STATUS_SETTINGS.tones.startingSoon,
      ),
    },
    startingSoonMinutes: normalizeMinutes(
      statusSettings?.startingSoonMinutes,
      DEFAULT_STATUS_SETTINGS.startingSoonMinutes,
    ),
  };
}

function normalizeStatusLabel(value: string | undefined, fallback: string) {
  const normalized = value?.trim().toUpperCase() ?? "";

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, STATUS_TEXT_MAX_LENGTH);
}

function normalizeHeaderMessage(value: string | undefined) {
  const normalized = formatBoardText(value ?? "", BOARD_HEADER_TEXT_MAX_LENGTH).trimEnd();

  return normalized || DEFAULT_BOARD_HEADER_MESSAGE;
}

function normalizeMinutes(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const rounded = Math.round(value as number);
  return Math.max(1, Math.min(180, rounded));
}

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readBlobBackedSettings() {
  const result = await get(SETTINGS_BLOB_PATH, {
    access: "private",
  });

  if (!result || result.statusCode !== 200) {
    return {
      headerMessage: DEFAULT_BOARD_HEADER_MESSAGE,
      statusSettings: DEFAULT_STATUS_SETTINGS,
      toneMappings: new Map<string, UserTone>(),
    };
  }

  const fileContents = await new Response(result.stream).text();
  const parsed = JSON.parse(fileContents) as AdminSettingsFile;

  return {
    headerMessage: normalizeHeaderMessage(parsed.headerMessage),
    statusSettings: normalizeStatusSettings(parsed.statusSettings),
    toneMappings: normalizeToneMappings(parsed.toneMappings ?? {}),
  };
}

async function writeBlobBackedSettings(settings: AdminSettingsFile) {
  await put(SETTINGS_BLOB_PATH, JSON.stringify(settings, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}
