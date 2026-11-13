import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { getDb } from "./mongodb";

const hash = (pw, salt) => scryptSync(pw, salt, 32).toString("hex");
const USERNAME = /^[a-z0-9._-]{3,20}$/;
const ROLES = new Set(["branch_admin", "branch", "staff", "doctor"]);
const PERMISSIONS = new Set([
  "appointments.view",
  "appointments.manage",
  "patients.view",
  "queue.manage",
  "schedules.manage",
  "doctors.view",
  "doctors.manage",
  "reports.view",
  "reports.upload",
  "billing.view",
  "billing.manage",
]);

async function col() {
  const d = await getDb();
  if (!d) return null;
  const c = d.collection("staff");
  await c.createIndex({ username: 1 }, { unique: true });
  await c.createIndex({ unit: 1, role: 1 });
  return c;
}

export async function createStaff({ name, username, password, role, unit = "", doctorSlug = "", doctorName = "", permissions = [] }) {
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
  const cleanUnit = typeof unit === "string" ? unit.trim() : "";
  if (cleanName.length < 2 || cleanName.length > 80) return "Name must be between 2 and 80 characters.";
  if (!USERNAME.test(cleanUsername) || cleanUsername === "admin") return "Use a valid username (3–20 lowercase letters, numbers, dots, underscores or hyphens).";
  if (typeof password !== "string" || password.length < 8 || password.length > 128) return "Password must be between 8 and 128 characters.";
  if (!ROLES.has(role) || role === "owner") return "Choose a valid staff account role.";
  if (!cleanUnit || cleanUnit.length > 160) return "Assign this account to a valid branch.";
  if (role === "doctor" && (typeof doctorSlug !== "string" || !doctorSlug.trim())) return "A doctor account must be assigned to a doctor.";
  const safePermissions = [...new Set(Array.isArray(permissions) ? permissions.filter((x) => typeof x === "string" && PERMISSIONS.has(x)) : [])];
  const finalPermissions = ["branch_admin", "branch"].includes(role) ? [...PERMISSIONS] : safePermissions;
  const c = await col();
  if (!c) return "The database is not connected.";
  const salt = randomBytes(16).toString("hex");
  try {
    await c.insertOne({
      name: cleanName,
      username: cleanUsername,
      role,
      unit: cleanUnit,
      doctorSlug: typeof doctorSlug === "string" ? doctorSlug.trim() : "",
      doctorName: typeof doctorName === "string" ? doctorName.trim().slice(0, 80) : "",
      permissions: finalPermissions,
      active: true,
      salt,
      hash: hash(password, salt),
      createdAt: new Date(),
    });
  } catch (e) {
    return e.code === 11000 ? "That username is already taken." : "Could not save the account.";
  }
  return "";
}

export async function listStaff(filter = {}) {
  const c = await col();
  return c ? c.find(filter, { projection: { _id: 0, salt: 0, hash: 0 } }).sort({ createdAt: -1 }).toArray() : [];
}

export async function deleteStaff(username, filter = {}) {
  const c = await col();
  if (c) await c.deleteOne({ username, ...filter });
}

export async function verifyStaff(username, password) {
  if (typeof username !== "string" || typeof password !== "string" || password.length > 128) return null;
  const c = await col();
  const u = c && await c.findOne({ username: username.trim().toLowerCase(), active: { $ne: false } });
  if (!u || !ROLES.has(u.role)) return null;
  const a = Buffer.from(hash(password, u.salt)), b = Buffer.from(u.hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const db = await getDb();
  if (u.unit && db) {
    const [branchName, branchArea] = u.unit.split(/,\s*(?=[^,]+$)/);
    const branch = branchName && branchArea ? await db.collection("units").findOne({ name: branchName, area: branchArea }, { projection: { active: 1 } }) : null;
    if (branch?.active === false) return null;
  }
  const legacyBranch = u.role === "branch";
  const role = legacyBranch ? "branch_admin" : u.role;
  return {
    u: u.username, name: u.name, role, unit: u.unit || "", doctorSlug: u.doctorSlug || "", doctorName: u.doctorName || "",
    permissions: u.permissions || (u.role === "doctor" ? ["queue.manage", "appointments.view"] : []),
    scope: ["branch", "branch_admin"].includes(role) ? (u.unit || "").replace("Ibn Sina ", "") : (u.doctorName || u.unit || "Staff"),
  };
}

export async function setStaffActive(username, active, filter = {}) {
  const c = await col();
  if (!c) return "The database is not connected.";
  const result = await c.updateOne({ username, ...filter, role: { $nin: ["owner"] } }, { $set: { active: !!active, updatedAt: new Date() } });
  return result.matchedCount ? "" : "Account not found.";
}

export async function getStaffSession(username) {
  const c = await col();
  if (!c) return null;
  const u = await c.findOne({ username, active: { $ne: false } });
  if (!u || !ROLES.has(u.role)) return null;
  const db = await getDb();
  if (u.unit && db) {
    const [name, area] = u.unit.split(/,\s*(?=[^,]+$)/);
    if (name && area) {
      const branch = await db.collection("units").findOne({ name, area }, { projection: { active: 1 } });
      if (branch?.active === false) return null;
    }
  }
  const role = u.role === "branch" ? "branch_admin" : u.role;
  return {
    u: u.username, name: u.name, role, unit: u.unit || "", doctorSlug: u.doctorSlug || "", doctorName: u.doctorName || "",
    permissions: u.permissions || (u.role === "doctor" ? ["queue.manage", "appointments.view"] : []),
    scope: ["branch", "branch_admin"].includes(role) ? (u.unit || "").replace("Ibn Sina ", "") : (u.doctorName || u.unit || "Staff"),
  };
}
