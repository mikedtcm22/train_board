import { NextResponse } from "next/server";
import { getBoardDisplayPayload } from "@/lib/board/get-display-payload";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getBoardDisplayPayload(new Date());

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
