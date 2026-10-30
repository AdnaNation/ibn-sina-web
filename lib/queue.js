import { randomBytes } from "crypto";
import { getDb } from "./mongodb";
import { startMs, todayDhaka } from "./time";

export const DEFAULTS = { startTime: "17:00", maxPatients: 40, avgMin: 8 };
const COME_BEFORE_MIN = 20; // "reach the hospital this long before your turn"
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newRef = () =>
  "IST-" +
  Array.from(randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");
export const sessionKey = (slug, date) => `${slug}|${date}`;

let ready;
async function conn() {
  const d = await getDb();
  if (!d) return null;
  ready ??= Promise.all([
    d.collection("sessions").createIndex({ key: 1 }, { unique: true }),
    d.collection("sessions").createIndex({ date: 1 }),
    d.collection("appointments").createIndex({ ref: 1 }, { unique: true }),
    d.collection("appointments").createIndex({ sessionKey: 1, serial: 1 }),
  ]).catch((e) => console.error("[queue] index:", e.message));
  await ready;
  return d;
}

/* A "session" = one doctor on one day. It owns the serial counter. */
export async function openSession(doctor, date) {
  const d = await conn();
  const key = sessionKey(doctor.slug, date);
  try {
    await d.collection("sessions").updateOne(
      { key },
      {
        $setOnInsert: {
          key,
          date,
          doctorSlug: doctor.slug,
          doctorName: doctor.name,
          department: doctor.department,
          unit: doctor.unit,
          status: "scheduled",
          startTime: DEFAULTS.startTime,
          maxPatients: DEFAULTS.maxPatients,
          avgMin: DEFAULTS.avgMin,
          delayMin: 0,
          notice: "",
          current: 0,
          lastSerial: 0,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (e) {
    if (e.code !== 11000) throw e;
  } // two people created it at once: fine
  return key;
}

/* ---------- time estimates ---------- */
function phase(s, now) {
  if (s.status === "finished" || s.status === "cancelled") return s.status;
  if (s.status === "break") return "break";
  if (s.status === "in_progress") return "live";
  return now > startMs(s.date, s.startTime) + (s.delayMin + 10) * 60000
    ? "late"
    : "waiting_start";
}

function estimate(s, ahead, now) {
  if (!s || s.status === "finished" || s.status === "cancelled") return null;
  const startsAt = startMs(s.date, s.startTime) + s.delayMin * 60000;
  let base = s.status === "scheduled" ? Math.max(startsAt, now) : now;
  if (s.status === "break") base += 10 * 60000;
  const seeingNow = s.current ? s.avgMin / 2 : 0; // current patient is on average half done
  const at = base + (seeingNow + ahead * s.avgMin) * 60000;
  return {
    at,
    minutes: Math.max(0, Math.round((at - now) / 60000)),
    comeBy: at - COME_BEFORE_MIN * 60000,
  };
}

function publicSession(s, now) {
  return {
    phase: phase(s, now),
    status: s.status,
    current: s.current,
    lastSerial: s.lastSerial,
    startTime: s.startTime,
    startsAt: startMs(s.date, s.startTime) + s.delayMin * 60000,
    delayMin: s.delayMin,
    notice: s.notice,
    avgMin: Math.round(s.avgMin),
  };
}

/* ---------- booking ---------- */
export async function book({
  doctor,
  date,
  name,
  phone,
  note = "",
  walkIn = false,
}) {
  const d = await conn();
  if (!d)
    return {
      error: "Online booking is unavailable right now. Please call 10615.",
    };
  const key = await openSession(doctor, date);
  const A = d.collection("appointments");

  if (!walkIn) {
    const dup = await A.findOne({
      sessionKey: key,
      phone,
      status: { $in: ["waiting", "serving"] },
    });
    if (dup)
      return {
        error: `This number already has serial ${dup.serial} with this doctor. Tracking code: ${dup.ref}.`,
        ref: dup.ref,
      };
  }

  // Atomic: increments only while seats remain, so two patients never share a serial.
  const s = await d.collection("sessions").findOneAndUpdate(
    {
      key,
      status: { $nin: ["finished", "cancelled"] },
      $expr: { $lt: ["$lastSerial", "$maxPatients"] },
    },
    { $inc: { lastSerial: 1 } },
    { returnDocument: "after" },
  );
  if (!s)
    return {
      error:
        "All serials for this day are taken or the session is closed. Please choose another date.",
    };

  const ref = newRef();
  await A.insertOne({
    ref,
    sessionKey: key,
    doctorSlug: doctor.slug,
    doctor: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    date,
    serial: s.lastSerial,
    name,
    phone,
    note,
    walkIn,
    status: "waiting",
    createdAt: new Date(),
  });
  return { ref, serial: s.lastSerial };
}

export async function cancelAppt(ref) {
  const d = await conn();
  if (d)
    await d
      .collection("appointments")
      .updateOne(
        { ref: String(ref).toUpperCase(), status: "waiting" },
        { $set: { status: "cancelled", cancelledAt: new Date() } },
      );
}

/* ---------- patient view ---------- */
export async function getTracking(ref) {
  if (!/^IST-[A-Z0-9]{6}$/i.test(ref || "")) return null;
  const d = await conn();
  if (!d) return null;
  const a = await d
    .collection("appointments")
    .findOne({ ref: ref.toUpperCase() }, { projection: { _id: 0 } });
  if (!a) return null;
  const s = await d
    .collection("sessions")
    .findOne({ key: a.sessionKey }, { projection: { _id: 0 } });
  const ahead =
    a.status === "waiting"
      ? await d.collection("appointments").countDocuments({
          sessionKey: a.sessionKey,
          status: "waiting",
          serial: { $lt: a.serial },
        })
      : 0;
  const now = Date.now();
  return {
    ref: a.ref,
    serial: a.serial,
    firstName: a.name.split(" ")[0],
    doctor: a.doctor,
    department: a.department,
    unit: a.unit,
    date: a.date,
    status: a.status,
    ahead,
    now,
    session: publicSession(s, now),
    eta: a.status === "waiting" ? estimate(s, ahead, now) : null,
  };
}

/* ---------- lobby board ---------- */
export async function getBoard() {
  const d = await conn();
  const now = Date.now();
  if (!d) return { now, sessions: [] };
  const date = todayDhaka();
  const [sessions, waiting] = await Promise.all([
    d
      .collection("sessions")
      .find({ date, status: { $ne: "cancelled" } }, { projection: { _id: 0 } })
      .sort({ startTime: 1, doctorName: 1 })
      .toArray(),
    d
      .collection("appointments")
      .aggregate([
        { $match: { date, status: "waiting" } },
        { $group: { _id: "$sessionKey", n: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const w = Object.fromEntries(waiting.map((x) => [x._id, x.n]));
  return {
    now,
    sessions: sessions.map((s) => ({
      key: s.key,
      doctor: s.doctorName,
      department: s.department,
      unit: s.unit,
      waiting: w[s.key] || 0,
      ...publicSession(s, now),
    })),
  };
}

/* ---------- staff console ---------- */
const scopeFilter = (p) =>
  p.role === "branch"
    ? { unit: p.unit }
    : p.role === "doctor"
      ? { doctorSlug: p.doctorSlug }
      : {};

/* Staff only get sessions inside their own scope. */
export async function getConsole(date, p) {
  const d = await conn();
  if (!d) return [];
  const sessions = await d
    .collection("sessions")
    .find({ date, ...scopeFilter(p) }, { projection: { _id: 0 } })
    .sort({ startTime: 1, doctorName: 1 })
    .toArray();
  const appts = await d
    .collection("appointments")
    .find(
      { sessionKey: { $in: sessions.map((s) => s.key) } },
      { projection: { _id: 0 } },
    )
    .sort({ serial: 1 })
    .toArray();
  return sessions.map((s) => ({
    ...s,
    patients: appts.filter((a) => a.sessionKey === s.key),
  }));
}

export async function sessionDoc(key) {
  const d = await conn();
  return d
    ? d.collection("sessions").findOne({ key }, { projection: { _id: 0 } })
    : null;
}

export async function apptKey(ref) {
  const d = await conn();
  const a =
    d &&
    (await d
      .collection("appointments")
      .findOne({ ref }, { projection: { sessionKey: 1 } }));
  return a?.sessionKey || "";
}

/* Next N days for one doctor: seats left and the time a new booking would be seen. */
export async function getAvailability(slug, days = 7) {
  const d = await conn();
  const dates = Array.from({ length: days }, (_, i) => todayDhaka(i));
  const keys = dates.map((x) => sessionKey(slug, x));
  const [rows, w] = d
    ? await Promise.all([
        d
          .collection("sessions")
          .find({ key: { $in: keys } })
          .toArray(),
        d
          .collection("appointments")
          .aggregate([
            { $match: { sessionKey: { $in: keys }, status: "waiting" } },
            { $group: { _id: "$sessionKey", n: { $sum: 1 } } },
          ])
          .toArray(),
      ])
    : [[], []];
  const waiting = Object.fromEntries(w.map((x) => [x._id, x.n]));
  const now = Date.now();
  return dates.map((date) => {
    const s = rows.find((r) => r.date === date) || {
      date,
      ...DEFAULTS,
      status: "scheduled",
      delayMin: 0,
      current: 0,
      lastSerial: 0,
    };
    const closed = ["finished", "cancelled"].includes(s.status);
    const eta = closed
      ? null
      : estimate(s, waiting[sessionKey(slug, date)] || 0, now);
    return {
      date,
      closed,
      left: closed ? 0 : Math.max(0, s.maxPatients - s.lastSerial),
      next: s.lastSerial + 1,
      startTime: s.startTime,
      delayMin: s.delayMin,
      etaAt: eta?.at || null,
    };
  });
}

/* Owner dashboard numbers */
export async function getStats(date) {
  const d = await conn();
  if (!d) return null;
  const [sessions, appts] = await Promise.all([
    d.collection("sessions").find({ date }).toArray(),
    d.collection("appointments").find({ date }).toArray(),
  ]);
  const n = (st) => appts.filter((a) => a.status === st).length;
  const seen = appts.filter(
    (a) => a.status === "done" && a.calledAt && a.doneAt,
  );
  const lates = sessions
    .filter((s) => s.startedAt)
    .map((s) => (new Date(s.startedAt) - startMs(s.date, s.startTime)) / 60000)
    .filter((m) => m > 10);
  const branches = {};
  for (const a of appts) {
    const b = (branches[a.unit] ||= { booked: 0, seen: 0 });
    if (a.status !== "cancelled") b.booked++;
    if (a.status === "done") b.seen++;
  }
  return {
    booked: appts.length - n("cancelled"),
    seen: n("done"),
    waiting: n("waiting"),
    skipped: n("skipped"),
    doctors: sessions.length,
    avgConsult: seen.length
      ? seen.reduce((t, a) => t + (a.doneAt - a.calledAt) / 60000, 0) /
        seen.length
      : 0,
    lateStarts: lates.length,
    avgLate: lates.length ? lates.reduce((t, m) => t + m, 0) / lates.length : 0,
    branches: Object.entries(branches)
      .map(([unit, v]) => ({ unit, ...v }))
      .sort((a, b) => b.booked - a.booked),
  };
}

/* One click: a realistic busy clinic for presenting to the authority. */
export async function loadDemo() {
  const d = await conn();
  if (!d) return;
  const date = todayDhaka(),
    slug = "demo-doctor",
    key = sessionKey(slug, date),
    now = Date.now();
  const unit = "Ibn Sina Specialized Hospital, Dhanmondi",
    cur = 6;
  const names = [
    "Rahim Uddin",
    "Nusrat Jahan",
    "Kamal Hossain",
    "Sultana Razia",
    "Tanvir Ahmed",
    "Farhana Akter",
    "Mizanur Rahman",
    "Shirin Sultana",
    "Abdul Karim",
    "Mahmuda Begum",
    "Imran Hossain",
    "Rokeya Khatun",
    "Jahid Hasan",
    "Salma Khatun",
  ];
  await d.collection("appointments").deleteMany({ demo: true });
  await d.collection("sessions").deleteMany({ doctorSlug: slug });
  await d.collection("sessions").insertOne({
    key,
    date,
    doctorSlug: slug,
    doctorName: "Dr. Demo Sharma",
    department: "Medicine",
    unit,
    status: "in_progress",
    startTime: "09:00",
    maxPatients: 40,
    avgMin: 7,
    delayMin: 20,
    notice: "The doctor was delayed by an emergency.",
    current: cur,
    lastSerial: names.length,
    startedAt: new Date(now - 45 * 60000),
    demo: true,
    createdAt: new Date(),
  });
  await d.collection("appointments").insertMany(
    names.map((name, i) => {
      const serial = i + 1;
      const status =
        serial < cur ? "done" : serial === cur ? "serving" : "waiting";
      const calledAt = new Date(now - (cur - serial + 1) * 7 * 60000);
      return {
        ref: `IST-DEMO${String(serial).padStart(2, "0")}`,
        sessionKey: key,
        doctorSlug: slug,
        doctor: "Dr. Demo Sharma",
        department: "Medicine",
        unit,
        date,
        serial,
        name,
        phone: `017000000${String(serial).padStart(2, "0")}`,
        note: "",
        walkIn: false,
        status,
        demo: true,
        createdAt: new Date(now - 3600000),
        ...(status !== "waiting" && { calledAt }),
        ...(status === "done" && { doneAt: new Date(+calledAt + 6.5 * 60000) }),
      };
    }),
  );
}

/* Finish the patient being seen, then call the next waiting serial. */
export async function advance(key, { skip = false, stop = false } = {}) {
  const d = await conn();
  if (!d) return;
  const A = d.collection("appointments"),
    S = d.collection("sessions");
  const s = await S.findOne({ key });
  if (!s || s.status === "finished" || s.status === "cancelled") return;

  const now = new Date();
  const set = { current: 0 };
  const cur = await A.findOne({ sessionKey: key, status: "serving" });
  if (cur) {
    await A.updateOne(
      { ref: cur.ref },
      { $set: { status: skip ? "skipped" : "done", doneAt: now } },
    );
    if (!skip && cur.calledAt) {
      // learn the doctor's real pace
      const mins = Math.min(45, Math.max(1, (now - cur.calledAt) / 60000));
      set.avgMin = Math.min(
        30,
        Math.max(3, Math.round((s.avgMin * 0.7 + mins * 0.3) * 10) / 10),
      );
    }
  }
  if (stop) {
    await S.updateOne(
      { key },
      { $set: { ...set, status: "finished", finishedAt: now } },
    );
    return;
  }
  const [next] = await A.find({ sessionKey: key, status: "waiting" })
    .sort({ serial: 1 })
    .limit(1)
    .toArray();
  if (next) {
    await A.updateOne(
      { ref: next.ref, status: "waiting" },
      { $set: { status: "serving", calledAt: now } },
    );
    set.current = next.serial;
    set.status = "in_progress";
    if (!s.startedAt) set.startedAt = now;
  }
  await S.updateOne({ key }, { $set: set });
}

export async function recall(ref) {
  const d = await conn();
  if (d)
    await d
      .collection("appointments")
      .updateOne({ ref, status: "skipped" }, { $set: { status: "waiting" } });
}

export async function patchSession(key, p) {
  const d = await conn();
  if (!d) return;
  const set = {};
  if (["scheduled", "in_progress", "break"].includes(p.status))
    set.status = p.status;
  if (p.delayMin !== undefined)
    set.delayMin = Math.min(600, Math.max(0, parseInt(p.delayMin) || 0));
  if (p.notice !== undefined) set.notice = String(p.notice).slice(0, 140);
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(p.startTime || ""))
    set.startTime = p.startTime;
  if (p.maxPatients !== undefined) {
    const s = await d.collection("sessions").findOne({ key });
    set.maxPatients = Math.min(
      200,
      Math.max(s?.lastSerial || 1, parseInt(p.maxPatients) || 40),
    );
  }
  if (Object.keys(set).length)
    await d.collection("sessions").updateOne({ key }, { $set: set });
}
