import test from "node:test";
import assert from "node:assert/strict";
import { formatDuration } from "../lib/duration.mjs";

test("formats minutes and hours in English", () => {
  assert.equal(formatDuration(159), "2 hours and 39 min");
  assert.equal(formatDuration(60), "1 hour");
  assert.equal(formatDuration(120), "2 hours");
  assert.equal(formatDuration(39), "39 min");
});

test("formats days, hours and remaining minutes in English", () => {
  assert.equal(formatDuration(234 * 60 + 52), "9 days and 18 hours and 52 min");
  assert.equal(formatDuration(10 * 1440 + 5 * 60), "10 days and 5 hours");
  assert.equal(formatDuration(1440), "1 day");
});

test("formats minutes, hours and days in Bangla without NaN", () => {
  assert.equal(formatDuration(159, "bn"), "২ ঘণ্টা ৩৯ মিনিট");
  assert.equal(formatDuration(60, "bn"), "১ ঘণ্টা");
  assert.equal(formatDuration(39, "bn"), "৩৯ মিনিট");
  assert.equal(formatDuration(0, "bn"), "০ মিনিট");
  assert.equal(formatDuration(234 * 60 + 52, "bn"), "৯ দিন ১৮ ঘণ্টা ৫২ মিনিট");
  assert.equal(formatDuration(10 * 1440 + 5 * 60, "bn"), "১০ দিন ৫ ঘণ্টা");
  assert.equal(formatDuration(1440, "bn"), "১ দিন");
});

test("rejects invalid and negative durations safely", () => {
  assert.equal(formatDuration(Number.NaN), "");
  assert.equal(formatDuration(undefined), "");
  assert.equal(formatDuration(-1), "");
});
