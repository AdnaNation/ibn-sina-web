import { buildSessionPatch } from "./queue-rules.mjs";
import { matchesWeeklySchedule, normalizeWeekdays } from "./weekly-schedule.mjs";
import { randomBytes } from "crypto";
import { generateTrackingReference, isValidTrackingReference } from "./tracking-reference.mjs";
import { getClient, getDb } from "./mongodb.js";
import { startMs, todayDhaka } from "./time.js";
import { hasPermission, scopeFilter } from "./access.mjs";

export const DEFAULTS = { startTime: "17:00", maxPatients: 40, avgMin: 8 };
const COME_BEFORE_MIN = 20; // "reach the hospital this long before your turn"
const newRef = generateTrackingReference;
export const sessionKey = (slug, date) => `${slug}|${date}`;

let ready;
async function conn() {
  const d = await getDb();
  if (!d) return null;
  ready ??= (async () => {
    const sessions = d.collection("sessions");
    const appointments = d.collection("appointments");
    await Promise.all([
      sessions.createIndex({ key: 1 }, { unique: true }),
      sessions.createIndex({ date: 1 }),
      appointments.createIndex({ ref: 1 }, { unique: true }),
      appointments.createIndex(
        { sessionKey: 1, phone: 1 },
        {
          unique: true,
          partialFilterExpression: {
            $and: [
              { $or: [{ status: "waiting" }, { status: "serving" }] },
              { phone: { $gt: "" } },
            ],
          },
          name: "unique_active_patient_per_session",
        },
      ),
    ]);

    // Replace the legacy non-unique index; createIndex cannot upgrade its options in place.
    try {
      await appointments.dropIndex("sessionKey_1_serial_1");
    } catch (error) {
      if (![26, 27].includes(error?.code)) throw error;
    }
    await appointments.createIndex(
      { sessionKey: 1, serial: 1 },
      { unique: true, name: "unique_session_serial" },
    );
    return true;
  })().catch((error) => {
    ready = undefined;
    console.error("[queue] index setup failed:", error?.message);
    return false;
  });
  const indexesReady = await ready;
  if (!indexesReady) return null;
  return d;
}

/* A "session" = one doctor on one day. It owns the serial counter. */
export async function openSession(doctor, date) {
  const d = await conn();
  if (!d) return { error: "The database is not connected. The queue could not be opened." };
  const key = sessionKey(doctor.slug, date);
  const sessions = d.collection("sessions");
  const weekly = await d.collection("weekly_schedules").findOne(
    { doctorSlug: doctor.slug, active: true },
  );
  const followsWeeklySchedule = Boolean(weekly && matchesWeeklySchedule(date, weekly));
  if (weekly && !followsWeeklySchedule) {
    return { error: "This doctor does not have an active weekly schedule for the selected date." };
  }
  const schedule = followsWeeklySchedule ? weekly : DEFAULTS;
  const existing = await sessions.findOne(
    { key },
    { projection: { status: 1, lastSerial: 1, current: 1 } },
  );
  if (existing && ["finished", "cancelled"].includes(existing.status)) {
    return { error: "This queue session is already closed and cannot be reopened." };
  }
  const sessionValues = {
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    startTime: schedule.startTime,
    ...(followsWeeklySchedule ? {
      endTime: weekly.endTime,
      maxPatients: weekly.maxPatients,
      avgMin: weekly.avgMin,
      weeklyScheduleId: weekly._id,
    } : {
      maxPatients: DEFAULTS.maxPatients,
      avgMin: DEFAULTS.avgMin,
    }),
  };
  try {
    // If an earlier manual start created an empty 5 PM placeholder, bring it
    // into line with the active weekly schedule before any serial is issued.
    const canRefreshEmptyPlaceholder =
      followsWeeklySchedule &&
      existing?.status === "scheduled" &&
      (existing.lastSerial || 0) === 0 &&
      (existing.current || 0) === 0;
    const update = canRefreshEmptyPlaceholder
      ? { $set: sessionValues }
      : {
          $setOnInsert: {
            key,
            date,
            ...sessionValues,
            status: "scheduled",
            delayMin: 0,
            notice: "",
            current: 0,
            lastSerial: 0,
            createdAt: new Date(),
          },
        };
    await sessions.updateOne({ key }, update, { upsert: true });
  } catch (e) {
    if (e.code !== 11000) {
      console.error("[queue] Could not open session:", e?.message);
      return { error: "The queue could not be opened right now. Please try again." };
    }
  }
  try {
    const current = await sessions.findOne({ key }, { projection: { status: 1 } });
    if (!current) return { error: "The queue session could not be found after opening." };
    if (["finished", "cancelled"].includes(current.status)) {
      return { error: "This queue session is already closed and cannot be reopened." };
    }
  } catch (e) {
    console.error("[queue] Could not verify opened session:", e?.message);
    return { error: "The queue could not be verified. Refresh and try again." };
  }
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
    endTime: s.endTime || null,
    sessionStartsAt: startMs(s.date, s.startTime),
    startsAt: startMs(s.date, s.startTime) + s.delayMin * 60000,
    endsAt: s.endTime ? startMs(s.date, s.endTime) : null,
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
      error: "Online booking is unavailable right now. Please try again later or contact the branch using its verified contact details.",
    };
  const normalizedPhone = String(phone || "")
    .replace(/[\s-]/g, "")
    .replace(/^\+?88(?=01)/, "");
  const key = sessionKey(doctor.slug, date);
  const session = await d.collection("sessions").findOne({ key });
  if (!session || (session.autoOpened && !session.weeklyScheduleId) || ["finished", "cancelled"].includes(session.status)) {
    return { error: "No appointment schedule has been published for this doctor and date. Please choose another date or contact the branch using its verified contact details." };
  }
  const A = d.collection("appointments");
  const S = d.collection("sessions");
  const client = await getClient();
  if (!client) return { error: "The booking service is temporarily unavailable." };

  // Commit the serial counter and appointment insert together so duplicate
  // concurrent submissions cannot reserve and waste multiple serials.
  const tx = client.startSession();
  let outcome;
  try {
    await tx.withTransaction(async () => {
      outcome = null;
      if (!walkIn) {
        const duplicate = await A.findOne(
          {
            sessionKey: key,
            phone: normalizedPhone,
            status: { $in: ["waiting", "serving"] },
          },
          { session: tx },
        );
        if (duplicate) {
          outcome = {
            error: `This number already has serial ${duplicate.serial} with this doctor. Tracking code: ${duplicate.ref}.`,
            ref: duplicate.ref,
          };
          return;
        }
      }

      const allocated = await S.findOneAndUpdate(
        {
          key,
          status: { $nin: ["finished", "cancelled"] },
          $expr: { $lt: ["$lastSerial", "$maxPatients"] },
        },
        { $inc: { lastSerial: 1 } },
        { returnDocument: "after", session: tx },
      );
      if (!allocated) {
        outcome = {
          error: "All serials for this day are taken or the session is closed. Please choose another date.",
        };
        return;
      }

      const ref = newRef();
      await A.insertOne(
        {
          ref,
          sessionKey: key,
          doctorSlug: doctor.slug,
          doctor: doctor.name,
          department: doctor.department,
          unit: doctor.unit,
          date,
          serial: allocated.lastSerial,
          name,
          phone: normalizedPhone,
          note,
          walkIn,
          status: "waiting",
          createdAt: new Date(),
        },
        { session: tx },
      );
      outcome = { ref, serial: allocated.lastSerial };
    }, {
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
      readPreference: "primary",
    });
    return outcome || { error: "The booking could not be completed. Please try again." };
  } catch (error) {
    if (error?.code === 11000 && !walkIn) {
      const duplicate = await A.findOne({
        sessionKey: key,
        phone: normalizedPhone,
        status: { $in: ["waiting", "serving"] },
      });
      if (duplicate) {
        return {
          error: `This number already has serial ${duplicate.serial} with this doctor. Tracking code: ${duplicate.ref}.`,
          ref: duplicate.ref,
        };
      }
    }
    console.error("[queue] booking transaction failed:", error?.message);
    return {
      error: "The booking service is temporarily unavailable. Please try again later.",
    };
  } finally {
    await tx.endSession();
  }
}

export async function cancelAppt(ref) {
  const d = await conn();
  if (!d) return { error: "The booking service is temporarily unavailable." };
  const result = await d.collection("appointments").updateOne(
    { ref: String(ref).toUpperCase(), status: "waiting" },
    { $set: { status: "cancelled", cancelledAt: new Date() } },
  );
  if (result.modifiedCount !== 1) {
    return { error: "This appointment could not be cancelled. It may already be updated or no longer waiting." };
  }
  return { ok: true };
}

/* ---------- patient view ---------- */
export async function getTracking(ref) {
  if (!isValidTrackingReference(ref)) return null;
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
/* Staff only get sessions inside their own scope. */
export async function getConsole(date, p, selectedDoctorSlug = "") {
  const d = await conn();
  if (!d) return [];
  const sessions = await d
    .collection("sessions")
    .find({ date, ...scopeFilter(p) }, { projection: { _id: 0 } })
    .sort({ startTime: 1, doctorName: 1 })
    .toArray();
  const selected = sessions.find((session) => session.doctorSlug === selectedDoctorSlug) || sessions[0];
  // The console renders one doctor's patient list at a time. Avoid loading every
  // patient's record for every doctor whenever a staff member switches tabs.
  const appts = selected
    ? await d
        .collection("appointments")
        .find({ sessionKey: selected.key }, { projection: { _id: 0 } })
        .sort({ serial: 1 })
        .toArray()
    : [];
  const canViewPatients = hasPermission(p, "patients.view");
  const patients = appts.map((a) => canViewPatients ? a : { ...a, phone: "", note: "" });
  return sessions.map((session) => ({
    ...session,
    patients: session.key === selected?.key ? patients : [],
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

/* Rolling booking window: create sessions only on configured recurring weekdays. */
export async function getAvailability(doctor, days = 5) {
  const d = await conn();
  if (!d || !doctor?.slug || !doctor?.name || !doctor?.unit) return null;
  const windowDays = Math.min(5, Math.max(1, Number.isInteger(days) ? days : 5));
  const dates = Array.from({ length: windowDays }, (_, i) => todayDhaka(i));
  const weekly = await d.collection("weekly_schedules").findOne(
    { doctorSlug: doctor.slug, active: true },
  );
  const eligibleDates = dates.filter((date) => matchesWeeklySchedule(date, weekly));
  const openedAt = new Date();

  // Refresh untouched weekly sessions when the recurring schedule changes.
  // Sessions with issued serials or active queue status are never rewritten.
  if (eligibleDates.length) {
    const scheduleValues = {
      doctorName: doctor.name,
      department: doctor.department,
      unit: doctor.unit,
      startTime: weekly.startTime,
      endTime: weekly.endTime,
      maxPatients: weekly.maxPatients,
      avgMin: weekly.avgMin,
      weeklyScheduleId: weekly._id,
    };
    await d.collection("sessions").updateMany(
      {
        doctorSlug: doctor.slug,
        date: { $in: eligibleDates },
        status: "scheduled",
        lastSerial: 0,
        $or: [{ autoOpened: true }, { weeklyScheduleId: { $exists: true } }],
      },
      { $set: scheduleValues },
    );
    // Keep the original single-upsert-per-key pattern for safe concurrent
    // availability requests; updates to existing records happen separately.
    await d.collection("sessions").bulkWrite(
      eligibleDates.map((date) => ({
        updateOne: {
          filter: { key: sessionKey(doctor.slug, date) },
          update: {
            $setOnInsert: {
              key,
              date,
              doctorSlug: doctor.slug,
              ...scheduleValues,
              status: "scheduled",
              delayMin: 0,
              notice: "",
              current: 0,
              lastSerial: 0,
              autoOpened: true,
              publishedBy: "Recurring weekly schedule",
              publishedAt: openedAt,
              createdAt: openedAt,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  const keys = dates.map((date) => sessionKey(doctor.slug, date));
  const [rows, w] = await Promise.all([
    d.collection("sessions").find({ key: { $in: keys } }).toArray(),
    d.collection("appointments").aggregate([
      { $match: { sessionKey: { $in: keys }, status: "waiting" } },
      { $group: { _id: "$sessionKey", n: { $sum: 1 } } },
    ]).toArray(),
  ]);
  const waiting = Object.fromEntries(w.map((x) => [x._id, x.n]));
  const now = Date.now();
  return dates.map((date) => {
    const found = rows.find((r) => r.date === date);
    const s = found?.autoOpened && !found.weeklyScheduleId ? null : found;
    if (!s) return { date, closed: true, unscheduled: true, left: 0, next: null, startTime: null, endTime: null, delayMin: 0, etaAt: null };
    const closed = ["finished", "cancelled"].includes(s.status);
    const left = closed ? 0 : Math.max(0, s.maxPatients - s.lastSerial);
    const eta = closed || !left ? null : estimate(s, waiting[sessionKey(doctor.slug, date)] || 0, now);
    return {
      date,
      closed: closed || !left,
      closedReason: closed ? "closed" : !left ? "full" : null,
      unscheduled: false,
      left,
      next: left ? s.lastSerial + 1 : null,
      startTime: s.startTime,
      endTime: s.endTime || null,
      delayMin: s.delayMin,
      etaAt: eta?.at || null,
    };
  });
}

/* ---------- owner schedule manager ---------- */
export async function getScheduleList(fromDate, toDate, user = null) {
  const d = await conn();
  if (!d) return null;
  const scope = !user || user.role === "owner"
    ? {}
    : user.role === "doctor"
      ? { doctorSlug: user.doctorSlug || "__NO_DOCTOR_SCOPE__" }
      : ["branch", "branch_admin", "staff"].includes(user.role)
        ? { unit: user.unit || "__NO_BRANCH_SCOPE__" }
        : { unit: "__NO_BRANCH_SCOPE__" };
  const [sessions, counts] = await Promise.all([
    d.collection("sessions")
      .find({ date: { $gte: fromDate, $lte: toDate }, ...scope }, { projection: { _id: 0 } })
      .sort({ date: 1, startTime: 1, doctorName: 1 })
      .toArray(),
    d.collection("appointments")
      .aggregate([
        { $match: { date: { $gte: fromDate, $lte: toDate }, status: { $ne: "cancelled" }, ...scope } },
        { $group: { _id: "$sessionKey", booked: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const booked = Object.fromEntries(counts.map((x) => [x._id, x.booked]));
  return sessions.map((s) => ({
    ...s,
    booked: booked[s.key] || 0,
    seatsLeft: Math.max(0, (s.maxPatients || 0) - (s.lastSerial || 0)),
    canRemove: s.status === "scheduled" && (s.lastSerial || 0) === 0 && (booked[s.key] || 0) === 0,
  }));
}

export async function saveWeeklySchedule({ doctor, weekdays, startTime, endTime, maxPatients, avgMin, endsOn = "", publishedBy = "Owner" }) {
  const d = await conn();
  if (!d) return "The database is not connected. Check MONGODB_URI.";
  const days = normalizeWeekdays(weekdays);
  if (!days.length || days.some((day) => !Number.isInteger(day) || day < 0 || day > 6))
    return "Choose at least one valid weekday.";
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");
  if (!validTime(startTime) || !validTime(endTime) || startTime >= endTime)
    return "Choose a valid start and end time. End time must be later than start time.";
  const seats = Number(maxPatients);
  const duration = Number(avgMin);
  if (!Number.isInteger(seats) || seats < 1 || seats > 200)
    return "Daily serial capacity must be between 1 and 200.";
  if (!Number.isInteger(duration) || duration < 3 || duration > 45)
    return "Average consultation time must be between 3 and 45 minutes.";
  if (endsOn) {
    const parsed = new Date(`${endsOn}T12:00:00+06:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endsOn) || Number.isNaN(parsed.getTime()) ||
      parsed.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) !== endsOn || endsOn < todayDhaka())
      return "Choose a valid future end date.";
  }
  const weeklyValues = {
    doctorSlug: doctor.slug, doctorName: doctor.name, department: doctor.department,
    unit: doctor.unit, weekdays: days, startTime, endTime, maxPatients: seats,
    avgMin: duration, endsOn: endsOn || null, active: true,
    publishedBy, updatedAt: new Date(),
  };
  await d.collection("weekly_schedules").updateOne(
    { doctorSlug: doctor.slug },
    { $set: weeklyValues, $setOnInsert: { createdAt: new Date() } },
    { upsert: true },
  );

  // Immediately sync future, untouched sessions so the live board and booking
  // page use the newly saved hours without waiting for a manual queue start.
  const weekly = await d.collection("weekly_schedules").findOne({ doctorSlug: doctor.slug, active: true });
  const windowDates = Array.from({ length: 5 }, (_, index) => todayDhaka(index));
  const upcoming = windowDates.filter((date) => matchesWeeklySchedule(date, weekly));
  const supersededDates = windowDates.filter((date) => !upcoming.includes(date));
  if (supersededDates.length) {
    await d.collection("sessions").updateMany(
      {
        doctorSlug: doctor.slug,
        date: { $in: supersededDates },
        status: "scheduled",
        lastSerial: 0,
        $or: [{ autoOpened: true }, { weeklyScheduleId: { $exists: true } }],
      },
      { $set: { status: "cancelled", cancelledAt: new Date(), scheduleSuperseded: true } },
    );
  }
  await Promise.all(upcoming.map((date) => d.collection("sessions").updateOne(
    {
      key: sessionKey(doctor.slug, date),
      status: "scheduled",
      lastSerial: 0,
      $or: [{ autoOpened: true }, { weeklyScheduleId: { $exists: true } }],
    },
    { $set: {
      doctorName: doctor.name,
      department: doctor.department,
      unit: doctor.unit,
      startTime,
      endTime,
      maxPatients: seats,
      avgMin: duration,
      weeklyScheduleId: weekly._id,
    } },
  )));
  return "";
}

export async function deactivateWeeklySchedule(doctorSlug, user) {
  const d = await conn();
  if (!d) return "The database is not connected.";
  const scope = user?.role === "owner" ? {} : { unit: user?.unit || "__NO_BRANCH_SCOPE__" };
  const result = await d.collection("weekly_schedules").updateOne(
    { doctorSlug, active: true, ...scope },
    { $set: { active: false, disabledAt: new Date(), disabledBy: user?.name || "Admin" } },
  );
  if (!result.modifiedCount) return "The weekly schedule was not found or is already disabled.";

  // Close only empty future sessions created from this recurring schedule.
  // Sessions with issued serials remain available to the patients already booked.
  const dates = Array.from({ length: 5 }, (_, index) => todayDhaka(index));
  await d.collection("sessions").updateMany(
    {
      doctorSlug,
      date: { $in: dates },
      status: "scheduled",
      lastSerial: 0,
      $or: [{ autoOpened: true }, { weeklyScheduleId: { $exists: true } }],
    },
    { $set: { status: "cancelled", cancelledAt: new Date(), scheduleSuperseded: true } },
  );
  return "";
}

export async function getWeeklyScheduleList(user = null) {
  const d = await conn();
  if (!d) return null;
  const scope = !user || user.role === "owner" ? {} : { unit: user.unit || "__NO_BRANCH_SCOPE__" };
  return d.collection("weekly_schedules")
    .find({ active: true, ...scope }, { projection: { _id: 0 } })
    .sort({ doctorName: 1 })
    .toArray();
}

export async function publishSchedule({ doctor, date, startTime, maxPatients, avgMin, publishedBy = "Owner" }) {
  const d = await conn();
  if (!d) return "The database is not connected. Check MONGODB_URI.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || date < todayDhaka())
    return "Choose today or a future date.";
  const parsedDate = new Date(`${date}T12:00:00+06:00`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) !== date)
    return "Enter a valid appointment date.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime || ""))
    return "Enter a valid start time.";
  const seats = Number(maxPatients);
  const duration = Number(avgMin);
  if (!Number.isInteger(seats) || seats < 1 || seats > 200)
    return "Daily serial capacity must be between 1 and 200.";
  if (!Number.isInteger(duration) || duration < 3 || duration > 45)
    return "Average consultation time must be between 3 and 45 minutes.";

  const key = sessionKey(doctor.slug, date);
  const S = d.collection("sessions");
  const existing = await S.findOne({ key });
  if (existing) {
    if (existing.status === "finished")
      return "This doctor’s session has already finished. Choose another date.";
    if (existing.status === "cancelled") {
      const prior = await d.collection("appointments").countDocuments({ sessionKey: key });
      if ((existing.lastSerial || 0) > 0 || prior > 0)
        return "This cancelled session has patient records and cannot be republished.";
      const restored = await S.updateOne(
        { key, status: "cancelled", lastSerial: 0 },
        { $set: { status: "scheduled", startTime, maxPatients: seats, avgMin: duration, publishedAt: new Date(), publishedBy }, $unset: { cancelledAt: "" } },
      );
      return restored.modifiedCount ? "" : "This session changed while you were publishing it. Refresh and try again.";
    }
    if (existing.status !== "scheduled" || (existing.lastSerial || 0) > 0)
      return "This session already has patient activity. Use the live queue console for operational changes.";
    const updated = await S.updateOne(
      { key, status: "scheduled", lastSerial: 0 },
      { $set: { startTime, maxPatients: seats, avgMin: duration, publishedAt: new Date(), publishedBy } },
    );
    return updated.modifiedCount ? "" : "This session changed while you were publishing it. Refresh and try again.";
  }
  try {
    await S.insertOne({
      key,
      date,
      doctorSlug: doctor.slug,
      doctorName: doctor.name,
      department: doctor.department,
      unit: doctor.unit,
      status: "scheduled",
      startTime,
      maxPatients: seats,
      avgMin: duration,
      delayMin: 0,
      notice: "",
      current: 0,
      lastSerial: 0,
      publishedAt: new Date(),
      publishedBy,
      createdAt: new Date(),
    });
  } catch (e) {
    if (e?.code === 11000) return "A schedule for this doctor and date already exists. Refresh the page.";
    throw e;
  }
  return "";
}

export async function removeEmptySchedule(key) {
  const d = await conn();
  if (!d) return "The database is not connected.";
  const S = d.collection("sessions");
  const s = await S.findOne({ key });
  if (!s) return "Schedule not found.";
  if (s.status !== "scheduled" || (s.lastSerial || 0) > 0)
    return "Only an unused, scheduled session can be removed.";
  const appointments = await d.collection("appointments").countDocuments({ sessionKey: key });
  if (appointments) return "This session has appointment records and cannot be removed.";
  const removed = await S.updateOne(
    { key, status: "scheduled", lastSerial: 0 },
    { $set: { status: "cancelled", cancelledAt: new Date() } },
  );
  return removed.modifiedCount ? "" : "This schedule changed while you were removing it. Refresh and try again.";
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

/* Finish the patient being seen, then call the next waiting serial. */
export async function advance(key, { skip = false, stop = false } = {}) {
  const d = await conn();
  if (!d) return { error: "The database is not connected." };
  const client = await getClient();
  if (!client) return { error: "The database is not connected." };
  const A = d.collection("appointments");
  const S = d.collection("sessions");
  const now = new Date();
  const lockToken = randomBytes(12).toString("hex");

  // Acquire a short lease outside the transaction. The token is checked by a
  // write inside the transaction, fencing off a worker whose lease was replaced.
  const locked = await S.findOneAndUpdate(
    {
      key,
      $or: [
        { advanceLockUntil: { $exists: false } },
        { advanceLockUntil: { $lte: now } },
      ],
    },
    {
      $set: {
        advanceLock: lockToken,
        advanceLockUntil: new Date(now.getTime() + 30000),
      },
    },
    { returnDocument: "after" },
  );
  if (!locked) return { error: "Another queue action is being processed. Please refresh and try again." };

  const tx = client.startSession();
  let outcome;
  try {
    await tx.withTransaction(async () => {
      outcome = null;
      const s = await S.findOne(
        { key, advanceLock: lockToken },
        { session: tx },
      );
      if (!s) {
        outcome = { error: "The queue action lock expired. Refresh and try again." };
        return;
      }
      if (s.status === "finished" || s.status === "cancelled") {
        outcome = { error: "This queue is already closed." };
        return;
      }

      const set = { current: 0 };
      const cur = await A.findOne(
        { sessionKey: key, status: "serving" },
        { session: tx },
      );
      if (cur) {
        const completed = await A.updateOne(
          { ref: cur.ref, status: "serving" },
          { $set: { status: skip ? "skipped" : "done", doneAt: now } },
          { session: tx },
        );
        if (completed.modifiedCount !== 1) {
          throw new Error("The current patient changed during the queue action.");
        }
        if (!skip && cur.calledAt) {
          const mins = Math.min(45, Math.max(1, (now - cur.calledAt) / 60000));
          set.avgMin = Math.min(
            30,
            Math.max(3, Math.round((s.avgMin * 0.7 + mins * 0.3) * 10) / 10),
          );
        }
      }

      if (stop) {
        const updated = await S.updateOne(
          { key, advanceLock: lockToken },
          { $set: { ...set, status: "finished", finishedAt: now } },
          { session: tx },
        );
        if (updated.matchedCount !== 1) {
          throw new Error("The queue action lock expired before the update committed.");
        }
        outcome = { ok: true };
        return;
      }

      const next = await A.find(
        { sessionKey: key, status: "waiting" },
        { session: tx },
      )
        .sort({ serial: 1 })
        .limit(1)
        .next();
      if (next) {
        const called = await A.updateOne(
          { ref: next.ref, status: "waiting" },
          { $set: { status: "serving", calledAt: now } },
          { session: tx },
        );
        if (called.modifiedCount !== 1) {
          throw new Error("The next patient changed during the queue action.");
        }
        set.current = next.serial;
        set.status = "in_progress";
        if (!s.startedAt) set.startedAt = now;
      }

      const updated = await S.updateOne(
        { key, advanceLock: lockToken },
        { $set: set },
        { session: tx },
      );
      if (updated.matchedCount !== 1) {
        throw new Error("The queue action lock expired before the update committed.");
      }
      outcome = { ok: true };
    }, {
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
      readPreference: "primary",
    });
    return outcome || { error: "The queue action could not be completed. Refresh and try again." };
  } catch (error) {
    console.error("[queue] advance transaction failed:", error?.message);
    return { error: "The queue could not be advanced. Refresh and try again." };
  } finally {
    await tx.endSession();
    await S.updateOne(
      { key, advanceLock: lockToken },
      { $unset: { advanceLock: "", advanceLockUntil: "" } },
    );
  }
}
export async function recall(ref) {
  const d = await conn();
  if (!d) return { error: "The database is not connected." };
  const result = await d.collection("appointments").updateOne(
    { ref, status: "skipped" },
    { $set: { status: "waiting" }, $unset: { doneAt: "", calledAt: "" } },
  );
  return result.modifiedCount
    ? { ok: true }
    : { error: "This patient is no longer marked as skipped. Refresh the queue and try again." };
}

export async function patchSession(key, p) {
  const d = await conn();
  if (!d) return { error: "The database is not connected." };
  const S = d.collection("sessions");
  const current = await S.findOne({ key });
  if (!current) return { error: "Queue session not found. Refresh and try again." };
  const decision = buildSessionPatch(current, p);
  if (decision.error) return { error: decision.error };
  const { set } = decision;

  const updated = await S.updateOne(
    { key, status: current.status },
    { $set: set },
  );
  return updated.modifiedCount
    ? { ok: true }
    : { error: "The queue changed while you were saving. Refresh and try again." };
}