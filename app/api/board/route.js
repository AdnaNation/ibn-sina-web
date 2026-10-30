import { NextResponse } from "next/server";
import { getBoard } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getBoard(), {
    headers: { "Cache-Control": "no-store" },
  });
}
