import { createHash } from "crypto";
import { getDb } from "./mongodb";
import { getUnits } from "./data";
import { todayDhaka } from "./time";

export async function writeAudit({ actor, action, targetType, targetId, details = {} }) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.collection("audit_logs").insertOne({
      actor: actor?.u || "system",
      actorName: actor?.name || "System",
      actorRole: actor?.role || "system",
      actorUnit: actor?.unit || "",
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[audit] Could not write audit event:", error.message);
  }
}

export async function getAllBranches() {
  const db = await getDb();
  if (!db) return (await getUnits()).map((u) => ({ ...u, active: u.active !== false }));
  const rows = await db.collection("units").find({}, { projection: { _id: 0 } }).sort({ order: 1, name: 1 }).toArray();
  return rows.length ? rows : (await getUnits()).map((u) => ({ ...u, active: true }));
}

export async function createBranch(data, actor) {
  const db = await getDb();
  if (!db) return "Connect MongoDB before creating a branch.";
  const { name, area, city, type, hotline, address } = data;
  if (name.length < 3 || area.length < 2 || city.length < 2) return "Enter a branch name, area and city.";
  const slugBase = `${name}-${area}-${city}`.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // Bangla-only branch names can produce an empty ASCII slug; give them a stable, unique fallback.
  const slug = slugBase || `branch-${createHash("sha256").update(`${name}|${area}|${city}`).digest("hex").slice(0, 10)}`;
  const unit = `${name}, ${area}`;
  const col = db.collection("units");
  if (await col.findOne({ $or: [{ slug }, { name, area }] })) return "A branch with this name and area already exists.";
  const order = await col.countDocuments();
  await col.insertOne({ slug, name, area, city, type, hotline, address, order, active: true, createdAt: new Date(), createdBy: actor?.u || "admin" });
  await writeAudit({ actor, action: "branch.created", targetType: "branch", targetId: unit, details: { slug, name, area, city, type } });
  return "";
}

export async function setBranchActive(unit, active, actor) {
  const db = await getDb();
  if (!db) return "Database is not connected.";
  const result = await db.collection("units").updateOne({ $expr: { $eq: [{ $concat: ["$name", ", ", "$area"] }, unit] } }, { $set: { active: !!active, updatedAt: new Date(), updatedBy: actor?.u || "admin" } });
  if (!result.matchedCount) return "Branch not found.";
  await writeAudit({ actor, action: active ? "branch.activated" : "branch.deactivated", targetType: "branch", targetId: unit });
  return "";
}

export async function getOrganizationStats(date = todayDhaka()) {
  const db = await getDb();
  if (!db) return null;
  const [branches, staff, doctors, sessions, appointments] = await Promise.all([
    getAllBranches(),
    db.collection("staff").find({}, { projection: { _id: 0, username: 1, name: 1, role: 1, unit: 1, active: 1, createdAt: 1 } }).toArray(),
    db.collection("doctors").find({}, { projection: { _id: 0, unit: 1 } }).toArray(),
    db.collection("sessions").find({ date }, { projection: { _id: 0, unit: 1 } }).toArray(),
    db.collection("appointments").find({ date }, { projection: { _id: 0, unit: 1, status: 1 } }).toArray(),
  ]);
  const rows = branches.map((b) => {
    const unit = `${b.name}, ${b.area}`;
    const members = staff.filter((s) => s.unit === unit);
    const appts = appointments.filter((a) => a.unit === unit);
    return {
      ...b,
      unit,
      activeAdmins: members.filter((s) => ["branch_admin", "branch"].includes(s.role) && s.active !== false).length,
      inactiveAdmins: members.filter((s) => ["branch_admin", "branch"].includes(s.role) && s.active === false).length,
      activeStaff: members.filter((s) => !["branch_admin", "branch"].includes(s.role) && s.active !== false).length,
      inactiveStaff: members.filter((s) => !["branch_admin", "branch"].includes(s.role) && s.active === false).length,
      doctors: doctors.filter((d) => d.unit === unit).length,
      sessions: sessions.filter((s) => s.unit === unit).length,
      booked: appts.filter((a) => a.status !== "cancelled").length,
      waiting: appts.filter((a) => a.status === "waiting").length,
      seen: appts.filter((a) => a.status === "done").length,
    };
  });
  return {
    date,
    branches: rows,
    totals: {
      branches: rows.length,
      activeBranches: rows.filter((b) => b.active !== false).length,
      inactiveBranches: rows.filter((b) => b.active === false).length,
      branchAdmins: staff.filter((s) => ["branch_admin", "branch"].includes(s.role)).length,
      activeBranchAdmins: staff.filter((s) => ["branch_admin", "branch"].includes(s.role) && s.active !== false).length,
      staff: staff.filter((s) => !["branch_admin", "branch"].includes(s.role)).length,
      activeStaff: staff.filter((s) => !["branch_admin", "branch"].includes(s.role) && s.active !== false).length,
      doctors: doctors.length,
      booked: appointments.filter((a) => a.status !== "cancelled").length,
      waiting: appointments.filter((a) => a.status === "waiting").length,
      seen: appointments.filter((a) => a.status === "done").length,
    },
  };
}

export async function getAuditLogs({ limit = 100, action = "" } = {}) {
  const db = await getDb();
  if (!db) return null;
  const filter = action ? { action: { $regex: action.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {};
  return db.collection("audit_logs").find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(Math.min(250, Math.max(1, limit))).toArray();
}
