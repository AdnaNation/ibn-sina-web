import { NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import { searchAppointments, toCsv } from "@/lib/appointments";
import { writeAudit } from "@/lib/management";

export const dynamic = "force-dynamic";

const validDate = (value) => {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export async function GET(req) {
  const p = await getSession();
  if (!p || !hasPermission(p, "reports.view")) {
    return new NextResponse("Not allowed", {
      status: 403,
      headers: { "Cache-Control": "no-store, private" },
    });
  }

  const sp = new URL(req.url).searchParams;
  const date = sp.get("date") || "";
  // Never interpret a missing or malformed date as permission to export all records.
  if (!validDate(date)) {
    return new NextResponse("A valid appointment date is required.", {
      status: 400,
      headers: {
        "Cache-Control": "no-store, private",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const rows = await searchAppointments(p, {
    date,
    q: (sp.get("q") || "").slice(0, 60),
    status: sp.get("status") || "",
  });
  if (rows === null) {
    return new NextResponse("The database is not connected.", {
      status: 503,
      headers: { "Cache-Control": "no-store, private" },
    });
  }

  await writeAudit({
    actor: p,
    action: "appointments.exported",
    targetType: "report",
    targetId: date,
    details: { rows: rows.length },
  });

  const csv = toCsv(rows, { withPhone: hasPermission(p, "patients.view") });
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="appointments-${date}.csv"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
