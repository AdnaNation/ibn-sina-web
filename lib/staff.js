import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { getDb } from "./mongodb";

const hash = (pw, salt) => scryptSync(pw, salt, 32).toString("hex");

async function col() {
  const d = await getDb();
  if (!d) return null;
  const c = d.collection("staff");
  await c.createIndex({ username: 1 }, { unique: true });
  return c;
}

// Returns an error message, or '' on success.
export async function createStaff({
  name,
  username,
  password,
  role,
  unit = "",
  doctorSlug = "",
  doctorName = "",
}) {
  const c = await col();
  if (!c) return "The database is not connected.";
  const salt = randomBytes(16).toString("hex");
  try {
    await c.insertOne({
      name,
      username,
      role,
      unit,
      doctorSlug,
      doctorName,
      salt,
      hash: hash(password, salt),
      createdAt: new Date(),
    });
  } catch (e) {
    return e.code === 11000
      ? "That username is already taken."
      : "Could not save the account.";
  }
  return "";
}

export async function listStaff() {
  const c = await col();
  return c
    ? c
        .find({}, { projection: { _id: 0, salt: 0, hash: 0 } })
        .sort({ createdAt: -1 })
        .toArray()
    : [];
}

export async function deleteStaff(username) {
  const c = await col();
  if (c) await c.deleteOne({ username });
}

export async function verifyStaff(username, password) {
  const c = await col();
  const u = c && (await c.findOne({ username }));
  if (!u) return null;
  const a = Buffer.from(hash(password, u.salt)),
    b = Buffer.from(u.hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return {
    u: u.username,
    name: u.name,
    role: u.role,
    unit: u.unit,
    doctorSlug: u.doctorSlug,
    scope: u.role === "branch" ? u.unit.replace("Ibn Sina ", "") : u.doctorName,
  };
}
