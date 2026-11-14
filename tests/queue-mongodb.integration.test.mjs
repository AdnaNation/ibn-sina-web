import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { getClient } from "../lib/mongodb.js";

const enabled = Boolean(process.env.MONGODB_TEST_URI);
const dbName = process.env.MONGODB_DB || "ibnsina_queue_test";
let client;
let db;
let queue;

before(async () => {
  if (!enabled) return;
  process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;
  process.env.MONGODB_DB = dbName;
  client = await getClient();
  db = client.db(dbName);
  await db.dropDatabase();
  // Simulate the pre-existing non-unique index so the migration path is exercised.
  await db.collection("appointments").createIndex({ sessionKey: 1, serial: 1 });
  queue = await import("../lib/queue.js");
});

after(async () => {
  if (!enabled || !client) return;
  await db.dropDatabase();
  await client.close();
});

test("availability stays closed without a configured weekly schedule", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
  const doctor = {
    slug: "auto-window-doctor",
    name: "Automatic Window Doctor",
    department: "Testing",
    unit: "Integration Test Unit",
  };
  const days = await queue.getAvailability(doctor);
  assert.equal(days.length, 5);
  assert.deepEqual(days.map((day) => day.date), Array.from({ length: 5 }, (_, index) => {
    const date = new Date(Date.now() + index * 86400000);
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  }));
  assert.ok(days.every((day) => day.closed && day.unscheduled && day.left === 0));
  const sessions = await db.collection("sessions")
    .find({ doctorSlug: doctor.slug })
    .toArray();
  assert.equal(sessions.length, 0);
});

test("manually starting a queue uses the doctor's active weekly schedule", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
  const doctor = {
    slug: "weekly-start-time-doctor",
    name: "Weekly Start Time Doctor",
    department: "Testing",
    unit: "Integration Test Unit",
  };
  const date = "2099-04-17";
  const weekday = new Date(`${date}T12:00:00+06:00`).getDay();
  const key = queue.sessionKey(doctor.slug, date);

  await db.collection("weekly_schedules").insertOne({
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    weekdays: [weekday],
    startTime: "14:00",
    endTime: "20:00",
    maxPatients: 25,
    avgMin: 12,
    active: true,
  });

  // Simulate an empty placeholder created by the previous hard-coded default.
  await db.collection("sessions").insertOne({
    key,
    date,
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    status: "scheduled",
    startTime: "17:00",
    maxPatients: 40,
    avgMin: 8,
    current: 0,
    lastSerial: 0,
  });

  assert.equal(await queue.openSession(doctor, date), key);
  const session = await db.collection("sessions").findOne({ key });
  assert.equal(session.startTime, "14:00");
  assert.equal(session.endTime, "20:00");
  assert.equal(session.maxPatients, 25);
  assert.equal(session.avgMin, 12);
  assert.ok(session.weeklyScheduleId);

  const nextDateValue = new Date(`${date}T12:00:00+06:00`);
  nextDateValue.setUTCDate(nextDateValue.getUTCDate() + 1);
  const offScheduleDate = nextDateValue.toISOString().slice(0, 10);
  const offScheduleResult = await queue.openSession(doctor, offScheduleDate);
  assert.match(offScheduleResult.error, /does not have an active weekly schedule/);
  assert.equal(await db.collection("sessions").findOne({ key: queue.sessionKey(doctor.slug, offScheduleDate) }), null);
});

test("concurrent bookings never allocate the same serial or exceed capacity", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
  const doctor = {
    slug: "integration-doctor",
    name: "Integration Test Doctor",
    department: "Testing",
    unit: "Integration Test Unit",
  };
  const date = "2099-04-15";
  const key = queue.sessionKey(doctor.slug, date);

  await db.collection("sessions").insertOne({
    key,
    date,
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    status: "scheduled",
    maxPatients: 5,
    lastSerial: 0,
    current: 0,
    startTime: "09:00",
    avgMin: 8,
    delayMin: 0,
    notice: "",
  });

  const results = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      queue.book({
        doctor,
        date,
        name: `Test Patient ${index}`,
        phone: `01710000${String(index).padStart(4, "0")}`,
      }),
    ),
  );

  const successful = results.filter((result) => result.ref);
  const stored = await db.collection("appointments")
    .find({ sessionKey: key })
    .sort({ serial: 1 })
    .toArray();
  const session = await db.collection("sessions").findOne({ key });

  assert.equal(successful.length, 5);
  assert.equal(stored.length, 5);
  assert.deepEqual(stored.map((item) => item.serial), [1, 2, 3, 4, 5]);
  assert.equal(new Set(stored.map((item) => item.serial)).size, stored.length);
  assert.equal(session.lastSerial, 5);
  const indexes = await db.collection("appointments").listIndexes().toArray();
  const serialIndex = indexes.find((index) => index.name === "unique_session_serial");
  assert.equal(serialIndex?.unique, true);
  assert.equal(indexes.some((index) => index.name === "sessionKey_1_serial_1"), false);
});

test("concurrent active bookings for the same phone create only one appointment", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
  const doctor = {
    slug: "duplicate-doctor",
    name: "Duplicate Test Doctor",
    department: "Testing",
    unit: "Integration Test Unit",
  };
  const date = "2099-04-16";
  const key = queue.sessionKey(doctor.slug, date);

  await db.collection("sessions").insertOne({
    key,
    date,
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    status: "scheduled",
    maxPatients: 20,
    lastSerial: 0,
    current: 0,
    startTime: "09:00",
    avgMin: 8,
    delayMin: 0,
    notice: "",
  });

  const results = await Promise.all(
    Array.from({ length: 12 }, () =>
      queue.book({
        doctor,
        date,
        name: "Same Patient",
        phone: "01712345678",
      }),
    ),
  );

  const active = await db.collection("appointments").find({
    sessionKey: key,
    phone: "01712345678",
    status: { $in: ["waiting", "serving"] },
  }).toArray();

  assert.equal(active.length, 1);
  assert.ok(results.every((result) => result.ref === active[0].ref));
  const session = await db.collection("sessions").findOne({ key });
  assert.equal(session.lastSerial, 1, "duplicate submissions must not consume extra serials");
});

test("simultaneous queue advances cannot call two patients at once", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
  const key = "advance-integration|2099-04-17";
  await db.collection("sessions").insertOne({
    key,
    date: "2099-04-17",
    doctorSlug: "advance-integration",
    doctorName: "Advance Test Doctor",
    department: "Testing",
    unit: "Integration Test Unit",
    status: "in_progress",
    maxPatients: 10,
    lastSerial: 2,
    current: 1,
    startTime: "09:00",
    avgMin: 8,
    delayMin: 0,
    notice: "",
  });
  await db.collection("appointments").insertMany([
    {
      ref: "IST-ADV001",
      sessionKey: key,
      serial: 1,
      name: "First Patient",
      status: "serving",
      calledAt: new Date(),
    },
    {
      ref: "IST-ADV002",
      sessionKey: key,
      serial: 2,
      name: "Second Patient",
      status: "waiting",
    },
  ]);

  const results = await Promise.all([queue.advance(key), queue.advance(key)]);
  const statuses = await db.collection("appointments")
    .find({ sessionKey: key })
    .sort({ serial: 1 })
    .toArray();
  const session = await db.collection("sessions").findOne({ key });

  assert.equal(results.filter((result) => result.ok).length, 1);
  assert.equal(results.filter((result) => result.error).length, 1);
  assert.deepEqual(statuses.map((item) => item.status), ["done", "serving"]);
  assert.equal(statuses.filter((item) => item.status === "serving").length, 1);
  assert.equal(session.current, 2);
});


test("concurrent availability requests safely create one five-day window", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
  const doctor = {
    slug: "concurrent-window-doctor",
    name: "Concurrent Window Doctor",
    department: "Testing",
    unit: "Integration Test Unit",
  };

  await db.collection("weekly_schedules").insertOne({
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "17:00",
    maxPatients: 40,
    avgMin: 8,
    active: true,
  });

  const results = await Promise.all(
    Array.from({ length: 12 }, () => queue.getAvailability(doctor)),
  );

  assert.ok(results.every((days) => Array.isArray(days) && days.length === 5));
  assert.ok(results.every((days) => days.every((day) => !day.unscheduled)));
  const sessions = await db.collection("sessions")
    .find({ doctorSlug: doctor.slug })
    .toArray();
  assert.equal(sessions.length, 5);
  assert.equal(new Set(sessions.map((session) => session.key)).size, 5);
  assert.ok(sessions.every((session) => session.status === "scheduled"));
});


test("saving a weekly schedule updates untouched upcoming sessions and exposes hours on the live board", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
  const doctor = {
    slug: "weekly-live-sync-doctor",
    name: "Weekly Live Sync Doctor",
    department: "Testing",
    unit: "Integration Test Unit",
  };
  const dateAt = (offset) => new Date(Date.now() + offset * 86400000)
    .toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  const today = dateAt(0);
  const tomorrow = dateAt(1);
  const weekdays = [
    new Date(`${today}T12:00:00+06:00`).getDay(),
    new Date(`${tomorrow}T12:00:00+06:00`).getDay(),
  ];
  const todayKey = queue.sessionKey(doctor.slug, today);
  const tomorrowKey = queue.sessionKey(doctor.slug, tomorrow);

  await db.collection("weekly_schedules").insertOne({
    doctorSlug: doctor.slug,
    doctorName: doctor.name,
    department: doctor.department,
    unit: doctor.unit,
    weekdays,
    startTime: "17:00",
    endTime: "22:00",
    maxPatients: 40,
    avgMin: 8,
    active: true,
  });
  await db.collection("sessions").insertMany([
    {
      key: todayKey,
      date: today,
      doctorSlug: doctor.slug,
      doctorName: doctor.name,
      department: doctor.department,
      unit: doctor.unit,
      status: "scheduled",
      startTime: "17:00",
      endTime: "22:00",
      maxPatients: 40,
      avgMin: 8,
      current: 0,
      lastSerial: 0,
      autoOpened: true,
      weeklyScheduleId: "previous-weekly-id",
    },
    {
      key: tomorrowKey,
      date: tomorrow,
      doctorSlug: doctor.slug,
      doctorName: doctor.name,
      department: doctor.department,
      unit: doctor.unit,
      status: "scheduled",
      startTime: "17:00",
      endTime: "22:00",
      maxPatients: 40,
      avgMin: 8,
      current: 0,
      lastSerial: 3,
      autoOpened: true,
      weeklyScheduleId: "previous-weekly-id",
    },
  ]);

  const result = await queue.saveWeeklySchedule({
    doctor,
    weekdays,
    startTime: "14:00",
    endTime: "20:00",
    maxPatients: 25,
    avgMin: 12,
  });
  assert.equal(result, "");

  const untouched = await db.collection("sessions").findOne({ key: todayKey });
  assert.equal(untouched.startTime, "14:00");
  assert.equal(untouched.endTime, "20:00");
  assert.equal(untouched.maxPatients, 25);
  assert.equal(untouched.avgMin, 12);

  const active = await db.collection("sessions").findOne({ key: tomorrowKey });
  assert.equal(active.startTime, "17:00", "sessions with issued serials must not be rewritten");
  assert.equal(active.endTime, "22:00");

  const board = await queue.getBoard();
  const live = board.sessions.find((session) => session.key === todayKey);
  if (today === dateAt(0)) {
    assert.equal(live?.startTime, "14:00");
    assert.equal(live?.endTime, "20:00");
    assert.ok(Number.isFinite(live?.sessionStartsAt));
    assert.ok(Number.isFinite(live?.endsAt));
  }

  assert.equal(await queue.deactivateWeeklySchedule(doctor.slug, { role: "owner", name: "Integration Test" }), "");
  const cancelledEmpty = await db.collection("sessions").findOne({ key: todayKey });
  const protectedBooked = await db.collection("sessions").findOne({ key: tomorrowKey });
  assert.equal(cancelledEmpty.status, "cancelled", "disabling recurring hours closes an empty future session");
  assert.equal(protectedBooked.status, "scheduled", "disabling recurring hours preserves sessions with issued serials");
});
