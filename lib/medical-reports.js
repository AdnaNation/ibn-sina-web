import { GridFSBucket, ObjectId } from "mongodb";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/mongodb";
import { scopeFilter } from "@/lib/access.mjs";

const BUCKET = "medical_report_files";
const ID_PATTERN = /^MR-[A-F0-9]{16}$/;

export function isMedicalReportId(value) {
  return typeof value === "string" && ID_PATTERN.test(value.trim().toUpperCase());
}

export function hashReportPasscode(passcode, salt) {
  return scryptSync(passcode, salt, 32).toString("hex");
}

export function verifyReportPasscode(passcode, report) {
  if (typeof passcode !== "string" || passcode.length < 8 || passcode.length > 64 || !report?.passcodeSalt || !report?.passcodeHash) return false;
  const actual = Buffer.from(hashReportPasscode(passcode, report.passcodeSalt), "hex");
  const expected = Buffer.from(report.passcodeHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function getMedicalReportCollection() {
  const db = await getDb();
  if (!db) return null;
  const reports = db.collection("medical_reports");
  await Promise.all([
    reports.createIndex({ reportId: 1 }, { unique: true }),
    reports.createIndex({ appointmentRef: 1, createdAt: -1 }),
    reports.createIndex({ unit: 1, createdAt: -1 }),
  ]);
  return { db, reports, bucket: new GridFSBucket(db, { bucketName: BUCKET }) };
}

export async function listMedicalReports(user) {
  const store = await getMedicalReportCollection();
  if (!store) return null;
  const rows = await store.reports.find(scopeFilter(user), {
    projection: { passcodeHash: 0, passcodeSalt: 0, _id: 0 },
  }).sort({ createdAt: -1 }).limit(100).toArray();
  return rows.map((row) => ({ ...row, createdAt: row.createdAt?.toISOString?.() || null }));
}

export async function removeMedicalReport(user, reportId) {
  const store = await getMedicalReportCollection();
  if (!store) return "The database is not connected.";
  const report = await store.reports.findOne({ reportId, ...scopeFilter(user) });
  if (!report) return "Report not found or you do not have access.";
  await store.reports.deleteOne({ _id: report._id });
  if (report.fileId instanceof ObjectId) {
    try { await store.bucket.delete(report.fileId); } catch (error) {
      console.error("[medical-reports] file removal failed:", error?.message);
      return "The report record was removed, but its file could not be deleted. Contact the system administrator.";
    }
  }
  return "";
}
