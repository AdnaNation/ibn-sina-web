import test from "node:test";
import assert from "node:assert/strict";
import { getNextPatientsBySession } from "../lib/live-board.mjs";

test("live board selects the lowest waiting serial for each session", () => {
  const result = getNextPatientsBySession([
    { sessionKey: "doctor-a", serial: 5 },
    { sessionKey: "doctor-b", serial: 4 },
    { sessionKey: "doctor-a", serial: 2 },
    { sessionKey: "doctor-b", serial: 1 },
  ]);

  assert.equal(result.nextBySession.get("doctor-a"), 2);
  assert.equal(result.nextBySession.get("doctor-b"), 1);
  assert.equal(result.emergencyNextBySession.size, 0);
});

test("emergency-priority patients are announced before regular waiting patients", () => {
  const result = getNextPatientsBySession([
    { sessionKey: "doctor-a", serial: 2 },
    { sessionKey: "doctor-a", serial: 5, emergencyPriority: true, emergencyAt: new Date("2026-11-15T10:02:00Z") },
    { sessionKey: "doctor-a", serial: 3, emergencyPriority: true, emergencyAt: new Date("2026-11-15T10:01:00Z") },
  ]);

  assert.equal(result.nextBySession.get("doctor-a"), 3);
  assert.equal(result.emergencyNextBySession.get("doctor-a"), 3);
});
