import { NextResponse } from "next/server";
import { getBoard } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "cron_secret_not_configured" }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const board = await getBoard();
  return NextResponse.json({
    ok: true,
    checkedAt: board.now,
    sessionsChecked: board.sessions.length,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
