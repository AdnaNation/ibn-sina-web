import test from "node:test";
import assert from "node:assert/strict";
import { isDemoEnvironment, isPublicBookingEnabled, isPublicCancellationEnabled } from "../lib/publicFeatures.mjs";

test("public self-service cancellation is disabled unless explicitly enabled", () => {
  assert.equal(isPublicCancellationEnabled({}), false);
  for (const value of ["false", "1", "TRUE", "", undefined, null]) {
    assert.equal(isPublicCancellationEnabled({ ENABLE_PUBLIC_CANCELLATION: value }), false);
  }
  assert.equal(isPublicCancellationEnabled({ ENABLE_PUBLIC_CANCELLATION: "true" }), true);
});

test("demo presentation mode uses an explicit flag and does not require a separate database", () => {
  assert.equal(isDemoEnvironment({}), false);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "false", MONGODB_DB: "ibnsina" }), false);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina" }), true);
});

test("public booking requires its own explicit authorization flag, even in demo mode", () => {
  assert.equal(isPublicBookingEnabled({}), false);
  assert.equal(isPublicBookingEnabled({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina" }), false);
  assert.equal(isPublicBookingEnabled({ ENABLE_DEMO: "true", ENABLE_PUBLIC_BOOKING: "false" }), false);
  assert.equal(isPublicBookingEnabled({ ENABLE_PUBLIC_BOOKING: "true", ENABLE_DEMO: "false" }), true);
});
