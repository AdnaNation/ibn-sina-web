import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/queue";
import { getDoctor } from "@/lib/data";
import { consumeRateLimit, requestFingerprint } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const rate = await consumeRateLimit({ scope: "public-availability", key: requestFingerprint(req), limit: 90 });
  if (rate.unavailable) return NextResponse.json({ error: "availability_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (!rate.allowed) return NextResponse.json({ error: "too_many_requests" }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))) } });

  const doctor = new URL(req.url).searchParams.get("doctor") || "";
  if (!/^[a-z0-9-]{1,100}$/.test(doctor))
    return NextResponse.json([], { status: 400, headers: { "Cache-Control": "no-store" } });
  const doctorRecord = await getDoctor(doctor);
  if (!doctorRecord) return NextResponse.json({ error: "doctor_not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  const availability = await getAvailability(doctorRecord, 5);
  if (!availability) return NextResponse.json({ error: "availability_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(availability, { headers: { "Cache-Control": "no-store" } });
}
