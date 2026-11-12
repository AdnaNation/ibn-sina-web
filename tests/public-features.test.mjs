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

test("demo mode requires an exact disposable demo database confirmation", () => {
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina", DEMO_DATABASE_NAME: "ibnsina" }), false);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina_demo", DEMO_DATABASE_NAME: "ibnsina" }), false);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina_demo", DEMO_DATABASE_NAME: "ibnsina_demo" }), true);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "false", MONGODB_DB: "ibnsina_demo", DEMO_DATABASE_NAME: "ibnsina_demo" }), false);
  assert.equal(isDemoEnvironment({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina", DEMO_DATABASE_NAME: "ibnsina" }), false);
});

test("public booking is disabled unless real booking is explicitly authorized or demo DB is isolated", () => {
  assert.equal(isPublicBookingEnabled({}), false);
  assert.equal(isPublicBookingEnabled({ ENABLE_PUBLIC_BOOKING: "false", ENABLE_DEMO: "false" }), false);
  assert.equal(isPublicBookingEnabled({ ENABLE_DEMO: "true" }), false);
  assert.equal(isPublicBookingEnabled({ ENABLE_DEMO: "true", MONGODB_DB: "ibnsina_demo", DEMO_DATABASE_NAME: "ibnsina_demo" }), true);
  assert.equal(isPublicBookingEnabled({ ENABLE_PUBLIC_BOOKING: "true", ENABLE_DEMO: "false" }), true);
});
