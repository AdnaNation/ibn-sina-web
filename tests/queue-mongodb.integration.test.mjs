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

test("availability automatically opens a rolling five-day window and preserves cancelled sessions", { skip: !enabled && "Set MONGODB_TEST_URI to run MongoDB integration tests" }, async () => {
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
  assert.ok(days.every((day) => !day.closed && !day.unscheduled && day.left === 40));
  const sessions = await db.collection("sessions")
    .find({ doctorSlug: doctor.slug })
    .sort({ date: 1 })
    .toArray();
  assert.equal(sessions.length, 5);
  assert.ok(sessions.every((session) =>
    session.autoOpened === true &&
    session.status === "scheduled" &&
    session.startTime === "17:00" &&
    session.maxPatients === 40
  ));

  const cancelledDate = days[1].date;
  await db.collection("sessions").updateOne(
    { key: queue.sessionKey(doctor.slug, cancelledDate) },
    { $set: { status: "cancelled", cancelledAt: new Date() } },
  );
  const refreshed = await queue.getAvailability(doctor);
  assert.equal(refreshed[1].closed, true);
  assert.equal(refreshed[1].closedReason, "closed");
  const cancelled = await db.collection("sessions").findOne({
    key: queue.sessionKey(doctor.slug, cancelledDate),
  });
  assert.equal(cancelled.status, "cancelled");
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
