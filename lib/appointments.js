import { getDb } from "./mongodb";
import { writeAudit } from "./management";
import { hasPermission } from "./permissions";

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Which appointments may this staff member see?
export const scopeOf = (p) =>
  p.role === "owner" ? {} : p.role === "doctor" ? { doctorSlug: p.doctorSlug } : { unit: p.unit };

export const maskPhone = (ph = "") => (ph.length > 5 ? ph.slice(0, 3) + "•••••" + ph.slice(-3) : ph);

export async function searchAppointments(p, { date, q = "", status = "" }) {
  const db = await getDb();
  if (!db) return null;
  const f = { ...scopeOf(p) };
  if (/^\d{4}-\d{2}-\d{2}$/.test(date || "")) f.date = date;
  if (["waiting", "serving", "done", "skipped", "cancelled"].includes(status)) f.status = status;
  const term = String(q || "").trim().slice(0, 60);
  const canViewPatients = hasPermission(p, "patients.view");
  if (term) {
    const r = { $regex: esc(term), $options: "i" };
    f.$or = canViewPatients
      ? [{ name: r }, { phone: r }, { ref: r }, { doctor: r }]
      : [{ ref: r }, { doctor: r }];
  }
  const rows = await db.collection("appointments").find(f, { projection: { _id: 0 } }).sort({ date: -1, doctor: 1, serial: 1 }).limit(400).toArray();
  // Appointment access does not imply access to patient identity or clinical notes.
  // Enforce this at the data boundary so pages and exports cannot accidentally leak fields.
  return canViewPatients ? rows : rows.map(({ name, phone, note, ...row }) => ({
    ...row,
    name: "Restricted",
    phone: "",
    note: "",
  }));
}

export async function cancelByStaff(p, ref) {
  const db = await getDb();
  if (!db) return "The database is not connected.";
  const a = await db.collection("appointments").findOne({ ref: String(ref).toUpperCase() });
  if (!a) return "Appointment not found.";
  const scope = scopeOf(p);
  if ((scope.unit && a.unit !== scope.unit) || (scope.doctorSlug && a.doctorSlug !== scope.doctorSlug)) return "Not allowed.";
  if (a.status !== "waiting") return "Only a waiting appointment can be cancelled.";
  const result = await db.collection("appointments").updateOne(
    { ref: a.ref, status: "waiting" },
    { $set: { status: "cancelled", cancelledAt: new Date(), cancelledBy: p.u || "admin" } },
  );
  if (!result.modifiedCount) return "This appointment has already changed. Refresh the list and try again.";
  await writeAudit({ actor: p, action: "appointment.cancelled", targetType: "appointment", targetId: a.ref, details: { serial: a.serial, doctor: a.doctor, date: a.date, unit: a.unit } });
  return "";
}

// Spreadsheets treat cells starting with = + - @ as formulas. Neutralise them.
const cell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export function toCsv(rows, { withPhone }) {
  const head = ["Date", "Serial", "Tracking code", "Patient", ...(withPhone ? ["Mobile"] : []), "Doctor", "Department", "Branch", "Status", "Walk-in", "Note"];
  const lines = rows.map((r) => [r.date, r.serial, r.ref, r.name, ...(withPhone ? [r.phone] : []), r.doctor, r.department, r.unit, r.status, r.walkIn ? "yes" : "no", r.note || ""].map(cell).join(","));
  return "\ufeff" + [head.map(cell).join(","), ...lines].join("\r\n");
}
