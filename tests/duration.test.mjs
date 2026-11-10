import test from "node:test";
import assert from "node:assert/strict";
import { formatDuration } from "../lib/duration.mjs";

test("formats hours and remaining minutes in English", () => {
  assert.equal(formatDuration(159), "2 hours and 39 min");
  assert.equal(formatDuration(60), "1 hour");
  assert.equal(formatDuration(120), "2 hours");
  assert.equal(formatDuration(39), "39 min");
});

test("formats hours and remaining minutes in Bangla without NaN", () => {
  assert.equal(formatDuration(159, "bn"), "২ ঘণ্টা ৩৯ মিনিট");
  assert.equal(formatDuration(60, "bn"), "১ ঘণ্টা");
  assert.equal(formatDuration(39, "bn"), "৩৯ মিনিট");
  assert.equal(formatDuration(0, "bn"), "০ মিনিট");
});

test("rejects invalid and negative durations safely", () => {
  assert.equal(formatDuration(Number.NaN), "");
  assert.equal(formatDuration(undefined), "");
  assert.equal(formatDuration(-1), "");
});
