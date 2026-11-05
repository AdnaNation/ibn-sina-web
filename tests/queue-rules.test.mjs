import test from "node:test";
import assert from "node:assert/strict";
import { buildSessionPatch } from "../lib/queue-rules.mjs";

const session = (overrides = {}) => ({
  status: "scheduled",
  lastSerial: 4,
  maxPatients: 20,
  delayMin: 0,
  notice: "",
  startTime: "17:00",
  ...overrides,
});

test("queue status transitions follow the allowed lifecycle", () => {
  assert.deepEqual(buildSessionPatch(session(), { status: "in_progress" }), { set: { status: "in_progress" } });
  assert.deepEqual(buildSessionPatch(session({ status: "in_progress" }), { status: "break" }), { set: { status: "break" } });
  assert.deepEqual(buildSessionPatch(session({ status: "break" }), { status: "in_progress" }), { set: { status: "in_progress" } });
  for (const status of ["scheduled", "break", "finished", "cancelled", "unknown"]) {
    assert.ok(buildSessionPatch(session(), { status }).error);
  }
});

test("closed sessions cannot be changed", () => {
  for (const status of ["finished", "cancelled"]) {
    assert.match(buildSessionPatch(session({ status }), { delayMin: 10 }).error, /closed/);
  }
  assert.ok(buildSessionPatch(null, { delayMin: 10 }).error);
  assert.ok(buildSessionPatch(session(), null).error);
  assert.ok(buildSessionPatch(session(), []).error);
});

test("delay, notice and start-time fields enforce boundaries", () => {
  assert.deepEqual(buildSessionPatch(session(), { delayMin: 600, notice: "  Clinic delayed  ", startTime: "23:59" }), {
    set: { delayMin: 600, notice: "Clinic delayed", startTime: "23:59" },
  });
  for (const delayMin of [-1, 601, 1.5, "not-a-number"]) {
    assert.ok(buildSessionPatch(session(), { delayMin }).error);
  }
  assert.ok(buildSessionPatch(session(), { notice: "x".repeat(141) }).error);
  assert.ok(buildSessionPatch(session(), { notice: 123 }).error);
  for (const startTime of ["24:00", "12:60", "9:00", "12:00 PM", 900]) {
    assert.ok(buildSessionPatch(session(), { startTime }).error);
  }
});

test("capacity cannot be invalid or reduced below issued serials", () => {
  assert.deepEqual(buildSessionPatch(session(), { maxPatients: 4 }), { set: { maxPatients: 4 } });
  assert.deepEqual(buildSessionPatch(session(), { maxPatients: 200 }), { set: { maxPatients: 200 } });
  for (const maxPatients of [0, 201, 4.5, "abc", 3]) {
    assert.ok(buildSessionPatch(session(), { maxPatients }).error);
  }
});

test("empty updates are rejected and valid mixed updates are normalized", () => {
  assert.ok(buildSessionPatch(session(), {}).error);
  assert.deepEqual(buildSessionPatch(session(), { delayMin: "15", notice: "  Updated  " }), {
    set: { delayMin: 15, notice: "Updated" },
  });
});
