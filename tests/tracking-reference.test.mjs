import test from "node:test";
import assert from "node:assert/strict";
import { generateTrackingReference, isValidTrackingReference } from "../lib/tracking-reference.mjs";

test("new tracking references use twelve unambiguous characters", () => {
  const ref = generateTrackingReference();
  assert.match(ref, /^IST-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/);
  assert.equal(isValidTrackingReference(ref), true);
});

test("legacy six-character tracking references remain valid", () => {
  assert.equal(isValidTrackingReference("IST-7K3F9Q"), true);
  assert.equal(isValidTrackingReference("ist-7k3f9q"), true);
});

test("tracking reference validation rejects malformed lengths and characters", () => {
  for (const value of ["", "IST-12345", "IST-1234567", "IST-12345678901", "IST-1234567890123", "XYZ-123456", null, 123]) {
    assert.equal(isValidTrackingReference(value), false);
  }
});
