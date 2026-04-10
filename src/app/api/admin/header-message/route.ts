import { NextResponse } from "next/server";
import {
  readStoredHeaderMessage,
  writeStoredHeaderMessage,
} from "@/lib/admin/admin-settings";
import { DEFAULT_BOARD_HEADER_MESSAGE } from "@/lib/board/board-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const headerMessage = await readStoredHeaderMessage();

    return NextResponse.json({
      headerMessage,
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
    };

    await writeStoredHeaderMessage(body.headerMessage ?? DEFAULT_BOARD_HEADER_MESSAGE);

    const headerMessage = await readStoredHeaderMessage();

    return NextResponse.json({
      headerMessage,
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
