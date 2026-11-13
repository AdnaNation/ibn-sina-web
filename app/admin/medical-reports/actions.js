"use server";

import { randomBytes } from "crypto";
import { GridFSBucket } from "mongodb";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, hasPermission } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { scopeFilter } from "@/lib/access.mjs";
import { hashReportPasscode, removeMedicalReport } from "@/lib/medical-reports";
import { isValidTrackingReference } from "@/lib/tracking-reference.mjs";
import { writeAudit } from "@/lib/management";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const TYPES = new Set(["Laboratory", "Imaging", "Pathology", "Prescription", "Other"]);
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

function detectFile(buffer) {
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { mime: "image/png", ext: "png" };
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

const field = (fd, key, max = 120) => String(fd.get(key) || "").trim().slice(0, max);

export async function uploadMedicalReport(fd) {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (!hasPermission(p, "reports.upload")) redirect("/admin");
  const appointmentRef = field(fd, "appointmentRef", 32).toUpperCase();
  const title = field(fd, "title", 100);
  const type = field(fd, "type", 30);
  const reportDate = field(fd, "reportDate", 10);
  const passcode = String(fd.get("passcode") || "").trim();
  const file = fd.get("file");

  let error = "";
  if (!isValidTrackingReference(appointmentRef)) error = "Enter a valid appointment tracking reference.";
  else if (title.length < 2) error = "Enter a report title.";
  else if (!TYPES.has(type)) error = "Choose a valid report type.";
  else if (!validDate(reportDate)) error = "Choose a valid report date.";
  else if (passcode.length < 10 || passcode.length > 64) error = "Use a patient access passcode of 10–64 characters.";
  else if (!(file instanceof File) || !file.size) error = "Choose a PDF or image file.";
  else if (file.size > MAX_FILE_BYTES) error = "The file must be 8 MB or smaller.";

  if (error) redirect(`/admin/medical-reports?err=${encodeURIComponent(error)}`);

  const db = await getDb();
  if (!db) redirect("/admin/medical-reports?err=Database%20is%20not%20connected.");
  const appointment = await db.collection("appointments").findOne({
    ref: appointmentRef,
    ...scopeFilter(p),
  }, { projection: { ref: 1, name: 1, phone: 1, unit: 1, doctor: 1, date: 1 } });
  if (!appointment) redirect("/admin/medical-reports?err=Appointment%20not%20found%20in%20your%20authorized%20scope.");

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length !== file.size || buffer.length > MAX_FILE_BYTES) redirect("/admin/medical-reports?err=Invalid%20file%20size.");
  const detected = detectFile(buffer);
  if (!detected) redirect("/admin/medical-reports?err=Only%20valid%20PDF,%20PNG,%20JPG%20or%20WEBP%20files%20are%20accepted.");

  const reports = db.collection("medical_reports");
  await Promise.all([
    reports.createIndex({ reportId: 1 }, { unique: true }),
    reports.createIndex({ appointmentRef: 1, createdAt: -1 }),
    reports.createIndex({ unit: 1, createdAt: -1 }),
  ]);
  const reportId = `MR-${randomBytes(8).toString("hex").toUpperCase()}`;
  const salt = randomBytes(16).toString("hex");
  const bucket = new GridFSBucket(db, { bucketName: "medical_report_files" });
  const safeName = `report-${reportId.toLowerCase()}.${detected.ext}`;
  let fileId;
  try {
    fileId = await new Promise((resolve, reject) => {
      const stream = bucket.openUploadStream(safeName, {
        contentType: detected.mime,
        metadata: { reportId, appointmentRef, unit: appointment.unit },
      });
      stream.once("error", reject);
      stream.once("finish", () => resolve(stream.id));
      stream.end(buffer);
    });
    await reports.insertOne({
      reportId,
      appointmentRef,
      patientName: appointment.name,
      unit: appointment.unit,
      doctor: appointment.doctor,
      appointmentDate: appointment.date,
      title,
      type,
      reportDate,
      fileId,
      fileName: safeName,
      contentType: detected.mime,
      size: buffer.length,
      passcodeSalt: salt,
      passcodeHash: hashReportPasscode(passcode, salt),
      createdBy: p.u,
      createdAt: new Date(),
      revokedAt: null,
    });
  } catch (e) {
    if (fileId) {
      try { await bucket.delete(fileId); } catch {}
    }
    console.error("[medical-reports] upload failed:", e?.message);
    redirect("/admin/medical-reports?err=The%20report%20could%20not%20be%20saved.");
  }

  await writeAudit({
    actor: p,
    action: "medical_report.uploaded",
    targetType: "medical_report",
    targetId: reportId,
    details: { type, unit: appointment.unit, size: buffer.length, contentType: detected.mime },
  });
  revalidatePath("/admin/medical-reports");
  redirect(`/admin/medical-reports?created=${encodeURIComponent(reportId)}`);
}

export async function revokeMedicalReport(fd) {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (!hasPermission(p, "reports.upload")) redirect("/admin");
  const reportId = field(fd, "reportId", 32).toUpperCase();
  const error = await removeMedicalReport(p, reportId);
  if (!error) {
    await writeAudit({ actor: p, action: "medical_report.revoked", targetType: "medical_report", targetId: reportId, details: {} });
    revalidatePath("/admin/medical-reports");
  }
  redirect(error ? `/admin/medical-reports?err=${encodeURIComponent(error)}` : "/admin/medical-reports?revoked=1");
}
