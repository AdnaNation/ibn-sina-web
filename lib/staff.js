import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { getDb } from "./mongodb";

const hash = (pw, salt) => scryptSync(pw, salt, 32).toString("hex");
async function col() {
  const d = await getDb();
  if (!d) return null;
  const c = d.collection("staff");
  await c.createIndex({ username: 1 }, { unique: true });
  await c.createIndex({ unit: 1, role: 1 });
  return c;
}

export async function createStaff({ name, username, password, role, unit = "", doctorSlug = "", doctorName = "", permissions = [] }) {
  const c = await col();
  if (!c) return "The database is not connected.";
  const salt = randomBytes(16).toString("hex");
  try {
    await c.insertOne({ name, username, role, unit, doctorSlug, doctorName, permissions: [...new Set(permissions)], active: true, salt, hash: hash(password, salt), createdAt: new Date() });
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
  const c = await col();
  const u = c && await c.findOne({ username, active: { $ne: false } });
  if (!u) return null;
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
  if (!u) return null;
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
