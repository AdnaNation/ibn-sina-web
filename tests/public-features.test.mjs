import test from "node:test";
import assert from "node:assert/strict";
import { isDemoEnvironment, isPublicBookingEnabled, isPublicCancellationEnabled } from "../lib/publicFeatures.mjs";

test("public self-service cancellation is enabled by default for the demo and can be disabled", () => {
  assert.equal(isPublicCancellationEnabled({}), true);
  assert.equal(isPublicCancellationEnabled({ ENABLE_PUBLIC_CANCELLATION: "true" }), true);
  assert.equal(isPublicCancellationEnabled({ ENABLE_PUBLIC_CANCELLATION: "false" }), false);
});

test("demo presentation mode uses an explicit flag and does not require a separate database", () => {
  assert.equal(isDemoEnvironment({}), false);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "false", MONGODB_DB: "ibnsina" }), false);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina" }), true);
});

test("public booking is enabled by default for the demo and can be disabled", () => {
  assert.equal(isPublicBookingEnabled({}), true);
  assert.equal(isPublicBookingEnabled({ ENABLE_PUBLIC_BOOKING: "true" }), true);
  assert.equal(isPublicBookingEnabled({ ENABLE_PUBLIC_BOOKING: "false" }), false);
});
