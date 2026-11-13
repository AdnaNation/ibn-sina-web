import { NextResponse } from "next/server";
import { GridFSBucket } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { consumeRateLimit, requestFingerprint } from "@/lib/rateLimit";
import { isMedicalReportId, verifyReportPasscode } from "@/lib/medical-reports";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const noStore = { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };

export async function POST(request) {
  const ip = requestFingerprint(request);
  const ipLimit = await consumeRateLimit({ scope: "medical-report-access-ip", key: ip, limit: 10 });
  if (ipLimit.unavailable) return NextResponse.json({ error: "The service is temporarily unavailable." }, { status: 503, headers: noStore });
  if (!ipLimit.allowed) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { ...noStore, "Retry-After": String(Math.max(1, Math.ceil((ipLimit.resetAt - Date.now()) / 1000))) } });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Enter a valid report ID and passcode." }, { status: 400, headers: noStore }); }
  const reportId = typeof body?.reportId === "string" ? body.reportId.trim().toUpperCase() : "";
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";
  if (!isMedicalReportId(reportId) || passcode.length < 10 || passcode.length > 64) {
    return NextResponse.json({ error: "The report ID or passcode is incorrect." }, { status: 404, headers: noStore });
  }

  const reportLimit = await consumeRateLimit({ scope: "medical-report-access-id", key: reportId, limit: 5 });
  if (reportLimit.unavailable) return NextResponse.json({ error: "The service is temporarily unavailable." }, { status: 503, headers: noStore });
  if (!reportLimit.allowed) return NextResponse.json({ error: "Too many attempts for this report. Please contact the branch." }, { status: 429, headers: { ...noStore, "Retry-After": String(Math.max(1, Math.ceil((reportLimit.resetAt - Date.now()) / 1000))) } });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "The service is temporarily unavailable." }, { status: 503, headers: noStore });
  const report = await db.collection("medical_reports").findOne({ reportId, revokedAt: null });
  if (!report || !verifyReportPasscode(passcode, report)) {
    return NextResponse.json({ error: "The report ID or passcode is incorrect." }, { status: 404, headers: noStore });
  }
  if (!report.fileId || !report.contentType || !["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(report.contentType)) {
    return NextResponse.json({ error: "This report file is unavailable." }, { status: 410, headers: noStore });
  }

  const bucket = new GridFSBucket(db, { bucketName: "medical_report_files" });
  try {
    const chunks = [];
    let total = 0;
    for await (const chunk of bucket.openDownloadStream(report.fileId)) {
      total += chunk.length;
      if (total > MAX_FILE_BYTES) return NextResponse.json({ error: "The stored report exceeds the allowed file size." }, { status: 413, headers: noStore });
      chunks.push(chunk);
    }
    if (!total || total !== report.size) return NextResponse.json({ error: "The report file is incomplete." }, { status: 410, headers: noStore });
    const file = Buffer.concat(chunks);
    const safeName = String(report.fileName || "medical-report").replace(/[^a-zA-Z0-9._-]/g, "_");
    return new NextResponse(file, {
      status: 200,
      headers: {
        ...noStore,
        "Content-Type": report.contentType,
        "Content-Length": String(file.length),
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  } catch (error) {
    console.error("[medical-reports] download failed:", error?.message);
    return NextResponse.json({ error: "The report file is unavailable." }, { status: 410, headers: noStore });
  }
}
