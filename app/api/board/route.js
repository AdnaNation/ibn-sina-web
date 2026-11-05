import { NextResponse } from "next/server";
import { getBoard } from "@/lib/queue";
import { consumeRateLimit, requestFingerprint } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const rate = await consumeRateLimit({ scope: "public-queue-board", key: requestFingerprint(request), limit: 120 });
  if (rate.unavailable) return NextResponse.json({ error: "service_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (!rate.allowed) return NextResponse.json({ error: "too_many_requests" }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) } });

  return NextResponse.json(await getBoard(), {
    headers: { "Cache-Control": "no-store" },
  });
}
