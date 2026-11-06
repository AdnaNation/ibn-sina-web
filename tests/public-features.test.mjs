import test from "node:test";
import assert from "node:assert/strict";
import { isPublicCancellationEnabled } from "../lib/publicFeatures.mjs";

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
