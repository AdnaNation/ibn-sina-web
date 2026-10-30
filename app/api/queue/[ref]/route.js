import { NextResponse } from "next/server";
import { getTracking } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const t = await getTracking((await params).ref);
  return t
    ? NextResponse.json(t, { headers: { "Cache-Control": "no-store" } })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
