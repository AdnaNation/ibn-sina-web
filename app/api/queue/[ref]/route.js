import { NextResponse } from "next/server";
import { getTracking } from "@/lib/queue";
import { consumeRateLimit, requestFingerprint } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const rate = await consumeRateLimit({ scope: "public-tracking", key: requestFingerprint(request), limit: 50 });
  if (rate.unavailable) return NextResponse.json({ error: "service_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (!rate.allowed) return NextResponse.json({ error: "too_many_requests" }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) } });

  const t = await getTracking((await params).ref);
  return t
    ? NextResponse.json(t, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } })
    : NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
}
