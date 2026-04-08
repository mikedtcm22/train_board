import { NextResponse } from "next/server";
import {
  readStoredStatusSettings,
  writeStoredStatusSettings,
} from "@/lib/admin/admin-settings";
import { DEFAULT_STATUS_SETTINGS } from "@/lib/board/status-rules";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await readStoredStatusSettings();

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load status settings.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      settings?: typeof DEFAULT_STATUS_SETTINGS;
    };

    await writeStoredStatusSettings(body.settings ?? DEFAULT_STATUS_SETTINGS);

    const settings = await readStoredStatusSettings();

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save status settings.",
      },
      { status: 500 },
    );
  }
}
