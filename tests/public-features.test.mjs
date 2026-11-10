import test from "node:test";
import assert from "node:assert/strict";
import {
  isPublicBookingEnabled,
  isPublicCancellationEnabled,
} from "../lib/publicFeatures.mjs";

test("public self-service cancellation is disabled when unset", () => {
  assert.equal(isPublicCancellationEnabled({}), false);
});

test("public self-service cancellation stays disabled for false-like values", () => {
  for (const value of ["false", "1", "TRUE", "", undefined, null]) {
    assert.equal(isPublicCancellationEnabled({ ENABLE_PUBLIC_CANCELLATION: value }), false);
  }
});

test("public self-service cancellation requires the exact explicit true value", () => {
  assert.equal(isPublicCancellationEnabled({ ENABLE_PUBLIC_CANCELLATION: "true" }), true);
});

test("public booking is disabled when both booking switches are unset or false", () => {
  assert.equal(isPublicBookingEnabled({}), false);
  assert.equal(isPublicBookingEnabled({ ENABLE_PUBLIC_BOOKING: "false", ENABLE_DEMO: "false" }), false);
});

test("demo mode explicitly enables prototype bookings", () => {
  assert.equal(isPublicBookingEnabled({ ENABLE_DEMO: "true" }), true);
});

test("authorized public booking can be enabled independently of demo mode", () => {
  assert.equal(isPublicBookingEnabled({ ENABLE_PUBLIC_BOOKING: "true", ENABLE_DEMO: "false" }), true);
});
