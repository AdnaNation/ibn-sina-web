import test from "node:test";
import assert from "node:assert/strict";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_TEST_URI;

test("MongoDB enforces queue serial and transition-lock concurrency", {
  skip: !uri ? "MONGODB_TEST_URI is not configured" : false,
}, async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const suffix = `_${process.pid}_${Date.now()}`;
  const sessions = db.collection(`queue_sessions_test${suffix}`);
  const appointments = db.collection(`queue_appointments_test${suffix}`);

  try {
    await sessions.insertOne({
      key: "doctor|2099-01-01",
      status: "scheduled",
      lastSerial: 0,
      maxPatients: 40,
    });
    await appointments.createIndex(
      { sessionKey: 1, serial: 1 },
      { unique: true, name: "unique_queue_serial_per_session" },
    );

    // Concurrent bookings must receive distinct serials and respect capacity.
    const allocations = await Promise.all(
      Array.from({ length: 48 }, () =>
        sessions.findOneAndUpdate(
          {
            key: "doctor|2099-01-01",
            status: { $nin: ["finished", "cancelled"] },
            $expr: { $lt: ["$lastSerial", "$maxPatients"] },
          },
          { $inc: { lastSerial: 1 } },
          { returnDocument: "after" },
        ),
      ),
    );
    const serials = allocations.filter(Boolean).map((session) => session.lastSerial);
    assert.equal(serials.length, 40);
    assert.deepEqual([...serials].sort((a, b) => a - b), Array.from({ length: 40 }, (_, i) => i + 1));
    assert.equal(new Set(serials).size, 40);

    await appointments.insertOne({ sessionKey: "doctor|2099-01-01", serial: 1, ref: "A" });
    await assert.rejects(
      appointments.insertOne({ sessionKey: "doctor|2099-01-01", serial: 1, ref: "B" }),
      (error) => error?.code === 11000,
    );

    // A single atomic lease acquisition must win among simultaneous staff actions.
    await sessions.updateOne(
      { key: "doctor|2099-01-01" },
      { $unset: { advanceLock: "", advanceLockUntil: "" } },
    );
    const now = new Date();
    const lockAttempts = await Promise.all(
      Array.from({ length: 24 }, (_, i) =>
        sessions.findOneAndUpdate(
          {
            key: "doctor|2099-01-01",
            $or: [
              { advanceLockUntil: { $exists: false } },
              { advanceLockUntil: { $lte: now } },
            ],
          },
          {
            $set: {
              advanceLock: `worker-${i}`,
              advanceLockUntil: new Date(now.getTime() + 30000),
            },
          },
          { returnDocument: "after" },
        ),
      ),
    );
    assert.equal(lockAttempts.filter(Boolean).length, 1);
  } finally {
    await sessions.drop().catch(() => {});
    await appointments.drop().catch(() => {});
    await client.close();
  }
});
