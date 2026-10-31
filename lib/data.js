import { getDb } from "./mongodb";
import {
  units as seedUnits,
  doctors as seedDoctors,
  services as seedServices,
  departments as seedDepartments,
} from "@/data/seed.mjs";

// Every reader falls back to the seed data, so the site runs before MongoDB is set up.
async function read(collection, query, fallback, opts = {}) {
  try {
    const db = await getDb();
    if (!db) return fallback;
    const rows = await db
      .collection(collection)
      .find(query, { projection: { _id: 0 } })
      .sort(opts.sort || {})
      .limit(opts.limit || 0)
      .toArray();
    return rows.length ? rows : fallback;
  } catch (e) {
    console.error(`[data] ${collection}:`, e.message);
    return fallback;
  }
}

export async function getUnits() {
  try {
    const db = await getDb();
    if (!db) return seedUnits;
    const col = db.collection("units");
    if (!(await col.estimatedDocumentCount())) return seedUnits;
    return col.find({ active: { $ne: false } }, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
  } catch (e) {
    console.error(`[data] units:`, e.message);
    return seedUnits;
  }
}
export const getServices = () =>
  read("services", {}, seedServices, { sort: { order: 1 } });
export const getDepartments = () =>
  read("departments", {}, seedDepartments, { sort: { name: 1 } });
export async function getFeaturedDoctors() {
  const [doctors, units] = await Promise.all([
    read("doctors", { featured: true }, seedDoctors.filter((d) => d.featured), { limit: 8 }),
    getUnits(),
  ]);
  const active = new Set(units.map((u) => `${u.name}, ${u.area}`));
  return doctors.filter((d) => active.has(d.unit));
}

export async function countDoctors() {
  try {
    const db = await getDb();
    return db
      ? await db.collection("doctors").estimatedDocumentCount()
      : seedDoctors.length;
  } catch {
    return seedDoctors.length;
  }
}

/* ---------- search, profiles, units ---------- */

const rx = (s) => ({
  $regex: s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  $options: "i",
});

// Use MongoDB only if the doctors collection has been seeded.
async function doctorsCol() {
  try {
    const db = await getDb();
    if (db && (await db.collection("doctors").estimatedDocumentCount()))
      return db.collection("doctors");
  } catch (e) {
    console.error("[data] doctors:", e.message);
  }
  return null;
}

export async function searchDoctors({
  q = "",
  department = "",
  branch = "",
  page = 1,
  perPage = 12,
}) {
  const depts = await getDepartments();
  const deptName = depts.find((d) => d.slug === department)?.name || "";
  const area = branch.split(",")[0].trim();
  const col = await doctorsCol();

  if (col) {
    const and = [];
    if (q) and.push({ $or: [{ name: rx(q) }, { department: rx(q) }] });
    if (deptName) and.push({ department: rx(deptName) });
    if (area) and.push({ unit: rx(area) });
    const activeUnitNames = (await getUnits()).map((u) => `${u.name}, ${u.area}`);
    and.push({ unit: { $in: activeUnitNames } });
    const filter = and.length ? { $and: and } : {};
    const [items, total] = await Promise.all([
      col
        .find(filter, { projection: { _id: 0 } })
        .sort({ name: 1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .toArray(),
      col.countDocuments(filter),
    ]);
    return { items, total };
  }

  const has = (a, b) => a.toLowerCase().includes(b.toLowerCase());
  const activeUnitNames = new Set((await getUnits()).map((u) => `${u.name}, ${u.area}`));
  const all = seedDoctors.filter(
    (d) =>
      activeUnitNames.has(d.unit) &&
      (!q || has(`${d.name} ${d.department}`, q)) &&
      (!deptName || has(d.department, deptName)) &&
      (!area || has(d.unit, area)),
  );
  return {
    items: all.slice((page - 1) * perPage, page * perPage),
    total: all.length,
  };
}

export async function getDoctor(slug) {
  const col = await doctorsCol();
  const doctor = col
    ? await col.findOne({ slug }, { projection: { _id: 0 } })
    : seedDoctors.find((d) => d.slug === slug) || null;
  if (!doctor) return null;
  const activeUnits = await getUnits();
  return activeUnits.some((u) => `${u.name}, ${u.area}` === doctor.unit) ? doctor : null;
}

export async function getDoctorsByArea(area) {
  const col = await doctorsCol();
  const active = new Set((await getUnits()).map((u) => `${u.name}, ${u.area}`));
  return col
    ? (await col.find({ unit: rx(area) }, { projection: { _id: 0 } }).limit(24).toArray()).filter((d) => active.has(d.unit))
    : seedDoctors.filter((d) => d.unit.toLowerCase().includes(area.toLowerCase()) && active.has(d.unit));
}

export async function getUnit(slug) {
  return (await getUnits()).find((u) => u.slug === slug) || null;
}

export const getAllDoctors = async () =>
  (await searchDoctors({ perPage: 500 })).items;
