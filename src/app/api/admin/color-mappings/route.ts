import { NextResponse } from "next/server";
import {
  DEFAULT_USER_TONE,
  USER_TONE_OPTIONS,
  type UserTone,
} from "@/lib/board/board-data";
import {
  mergeToneMappings,
  readStoredToneMappings,
  writeStoredToneMappings,
} from "@/lib/admin/admin-settings";
import {
  getCalendarIntegrationSummary,
  listCalendarSharedIdentities,
} from "@/lib/calendar/google-calendar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const integration = getCalendarIntegrationSummary();
    const envToneMappings = new Map(
      integration.toneMappings.map(({ identity, tone }) => [identity, tone]),
    );
    const storedToneMappings = await readStoredToneMappings();
    const mergedToneMappings = mergeToneMappings(envToneMappings, storedToneMappings);

    if (!integration.configured) {
      return NextResponse.json({
        accounts: [...mergedToneMappings.entries()].map(([email, tone]) => ({
          email,
          source: "saved" as const,
          tone,
        })),
        issue: `Calendar integration is incomplete. Missing: ${integration.missing.join(", ")}`,
        sourceLabel: "Saved mappings only",
      });
    }

    const sharedIdentities = await listCalendarSharedIdentities();
    const sourceByEmail = new Map<string, "acl" | "event" | "owner" | "saved">();

    for (const identity of sharedIdentities.identities) {
      sourceByEmail.set(identity.email, identity.source);
    }

    for (const email of mergedToneMappings.keys()) {
      if (!sourceByEmail.has(email)) {
        sourceByEmail.set(email, "saved");
      }
    }

    const accounts = [...sourceByEmail.entries()]
      .map(([email, source]) => ({
        email,
        source,
        tone: mergedToneMappings.get(email) ?? DEFAULT_USER_TONE,
      }))
      .sort((left, right) => left.email.localeCompare(right.email));

    return NextResponse.json({
      accounts,
      issue: sharedIdentities.issue,
      sourceLabel: sharedIdentities.sourceLabel,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load color mappings.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mappings?: Array<{
        identity?: string;
        tone?: string;
      }>;
    };

    const mappings = (body.mappings ?? [])
      .map((mapping) => ({
        identity: mapping.identity?.trim().toLowerCase() ?? "",
        tone: mapping.tone ?? "",
      }))
      .filter(
        (mapping): mapping is { identity: string; tone: UserTone } =>
          Boolean(mapping.identity) && isUserTone(mapping.tone),
      );

    await writeStoredToneMappings(mappings);

    const savedToneMappings = await readStoredToneMappings();
    const accounts = [...savedToneMappings.entries()]
      .map(([email, tone]) => ({
        email,
        source: "saved" as const,
        tone,
      }))
      .sort((left, right) => left.email.localeCompare(right.email));

    return NextResponse.json({
      accounts,
      sourceLabel: "Saved mappings",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save color mappings.",
      },
      { status: 500 },
    );
  }
}

function isUserTone(value: string): value is UserTone {
  return USER_TONE_OPTIONS.includes(value as UserTone);
}
