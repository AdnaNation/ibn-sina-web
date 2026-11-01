import { NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import { searchAppointments, toCsv } from "@/lib/appointments";
import { writeAudit } from "@/lib/management";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const p = await getSession();
  if (!p || !hasPermission(p, "reports.view")) return new NextResponse("Not allowed", { status: 403 });
  const sp = new URL(req.url).searchParams;
  const rows = (await searchAppointments(p, { date: sp.get("date") || "", q: sp.get("q") || "", status: sp.get("status") || "" })) || [];
  await writeAudit({ actor: p, action: "appointments.exported", targetType: "report", targetId: sp.get("date") || "all", details: { rows: rows.length } });
  const csv = toCsv(rows, { withPhone: hasPermission(p, "patients.view") });
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="appointments-${sp.get("date") || "all"}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
