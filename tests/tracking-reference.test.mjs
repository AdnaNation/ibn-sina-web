import test from "node:test";
import assert from "node:assert/strict";
import { generateTrackingReference, isValidTrackingReference } from "../lib/tracking-reference.mjs";

test("new tracking references use a 12-character high-entropy suffix", () => {
  const value = generateTrackingReference();
  assert.match(value, /^IST-[A-Z0-9]{12}$/);
  assert.equal(isValidTrackingReference(value), true);
});

test("legacy six-character tracking references remain valid", () => {
  assert.equal(isValidTrackingReference("IST-7K3F9Q"), true);
  assert.equal(isValidTrackingReference("ist-7k3f9q"), true);
});

test("malformed tracking references are rejected", () => {
  for (const value of ["", null, "IST-ABC", "IST-1234567", "IST-1234567890123", "ABC-123456", "IST-12345!", "IST-123456789012-extra"]) {
    assert.equal(isValidTrackingReference(value), false);
  }
});
