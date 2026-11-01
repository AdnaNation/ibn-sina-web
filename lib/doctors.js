import { getDb } from "./mongodb";
import { getUnits, getDepartments } from "./data";
import { doctors as seedDoctors } from "@/data/seed.mjs";
import { writeAudit } from "./management";

export const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function listDoctorsAdmin(p) {
  const db = await getDb();
  if (!db) return { connected: false, rows: [], seeded: false };
  const col = db.collection("doctors");
  const seeded = (await col.estimatedDocumentCount()) > 0;
  const filter = p.role === "owner" ? {} : { unit: p.unit };
  const rows = seeded ? await col.find(filter, { projection: { _id: 0 } }).sort({ unit: 1, name: 1 }).toArray() : [];
  return { connected: true, rows, seeded };
}

// The public site falls back to starter data until the doctors collection has records.
// Importing copies that starter list into MongoDB so it can be edited here.
export async function importStarterDoctors(actor) {
  const db = await getDb();
  if (!db) return "The database is not connected.";
  const col = db.collection("doctors");
  if (await col.estimatedDocumentCount()) return "Doctors are already imported.";
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.insertMany(seedDoctors.map((d) => ({ ...d, createdAt: new Date() })));
  await writeAudit({ actor, action: "doctor.imported", targetType: "doctor", targetId: "starter", details: { count: seedDoctors.length } });
  return "";
}

async function validate(p, d, { unitLocked } = {}) {
  if (d.name.length < 4) return "Enter the doctor’s full name, for example “Dr. Rahim Uddin”.";
  const depts = await getDepartments();
  if (!depts.some((x) => x.name === d.department)) return "Choose a department from the list.";
  if (d.phone && !/^[0-9+\- ]{4,18}$/.test(d.phone)) return "Enter a valid phone number or leave it empty.";
  if (!unitLocked) {
    const units = await getUnits();
    if (!units.some((u) => `${u.name}, ${u.area}` === d.unit)) return "Choose a valid branch.";
    if (p.role !== "owner" && d.unit !== p.unit) return "You can manage doctors of your own branch only.";
  }
  return "";
}

export async function createDoctor(p, d) {
  const db = await getDb();
  if (!db) return "The database is not connected.";
  const col = db.collection("doctors");
  if (!(await col.estimatedDocumentCount())) return "Import the starter doctor list first, then add new doctors.";
  const err = await validate(p, d);
  if (err) return err;
  let slug = slugify(d.name), i = 2;
  while (await col.findOne({ slug }, { projection: { _id: 1 } })) slug = `${slugify(d.name)}-${i++}`;
  await col.insertOne({ slug, name: d.name, nameBn: d.nameBn || "", department: d.department, unit: d.unit, phone: d.phone || "10615", photo: null, featured: !!d.featured, createdAt: new Date(), createdBy: p.u || "admin" });
  await writeAudit({ actor: p, action: "doctor.created", targetType: "doctor", targetId: slug, details: { name: d.name, unit: d.unit, department: d.department } });
  return "";
}

export async function updateDoctor(p, slug, d) {
  const db = await getDb();
  if (!db) return "The database is not connected.";
  const col = db.collection("doctors");
  const cur = await col.findOne({ slug });
  if (!cur) return "Doctor not found.";
  if (p.role !== "owner" && cur.unit !== p.unit) return "Not allowed.";
  const err = await validate(p, { ...d, unit: cur.unit }, { unitLocked: true });
  if (err) return err;
  await col.updateOne({ slug }, { $set: { name: d.name, nameBn: d.nameBn || "", department: d.department, phone: d.phone || "10615", featured: !!d.featured, updatedAt: new Date() } });
  await writeAudit({ actor: p, action: "doctor.updated", targetType: "doctor", targetId: slug, details: { name: d.name, featured: !!d.featured } });
  return "";
}

export async function deleteDoctor(p, slug) {
  const db = await getDb();
  if (!db) return "The database is not connected.";
  const col = db.collection("doctors");
  const cur = await col.findOne({ slug });
  if (!cur) return "Doctor not found.";
  if (p.role !== "owner" && cur.unit !== p.unit) return "Not allowed.";
  if (await db.collection("sessions").countDocuments({ doctorSlug: slug })) return "This doctor has schedules or patient records and cannot be deleted.";
  await col.deleteOne({ slug });
  await writeAudit({ actor: p, action: "doctor.deleted", targetType: "doctor", targetId: slug, details: { name: cur.name, unit: cur.unit } });
  return "";
}
