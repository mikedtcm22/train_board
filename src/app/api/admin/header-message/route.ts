import { NextResponse } from "next/server";
import {
  readStoredHeaderMessage,
  readStoredHeaderTone,
  writeStoredHeaderSettings,
} from "@/lib/admin/admin-settings";
import {
  DEFAULT_BOARD_HEADER_MESSAGE,
  DEFAULT_BOARD_HEADER_TONE,
} from "@/lib/board/board-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [headerMessage, headerTone] = await Promise.all([
      readStoredHeaderMessage(),
      readStoredHeaderTone(),
    ]);

    return NextResponse.json({
      headerMessage,
      headerTone,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load header message.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      headerMessage?: string;
      headerTone?: typeof DEFAULT_BOARD_HEADER_TONE;
    };

    await writeStoredHeaderSettings(
      body.headerMessage ?? DEFAULT_BOARD_HEADER_MESSAGE,
      body.headerTone ?? DEFAULT_BOARD_HEADER_TONE,
    );

    const [headerMessage, headerTone] = await Promise.all([
      readStoredHeaderMessage(),
      readStoredHeaderTone(),
    ]);

    return NextResponse.json({
      headerMessage,
      headerTone,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save header message.",
      },
      { status: 500 },
    );
  }
}
