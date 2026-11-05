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
  queue = await import("../lib/queue.js");
});

after(async () => {
  if (!enabled || !client) return;
  await db.dropDatabase();
  await client.close();
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
