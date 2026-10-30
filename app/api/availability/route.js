import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const doctor = new URL(req.url).searchParams.get("doctor") || "";
  if (!/^[a-z0-9-]+$/.test(doctor))
    return NextResponse.json([], { status: 400 });
  return NextResponse.json(await getAvailability(doctor), {
    headers: { "Cache-Control": "no-store" },
  });
}
