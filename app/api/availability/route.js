import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const doctor = new URL(req.url).searchParams.get("doctor") || "";
  if (!/^[a-z0-9-]+$/.test(doctor))
    return NextResponse.json([], { status: 400 });
  const availability = await getAvailability(doctor, 15);
  if (!availability) return NextResponse.json({ error: "availability_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(availability, { headers: { "Cache-Control": "no-store" } });
}
