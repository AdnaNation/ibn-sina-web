import test from "node:test";
import assert from "node:assert/strict";
import { matchesWeeklySchedule, normalizeWeekdays } from "../lib/weekly-schedule.mjs";

test("Friday-only schedule matches Fridays in Bangladesh local calendar", () => {
  const schedule = { active: true, weekdays: [5], startTime: "14:00", endTime: "20:00" };
  assert.equal(matchesWeeklySchedule("2026-11-13", schedule), true);
  assert.equal(matchesWeeklySchedule("2026-11-14", schedule), false);
});

test("weekly schedule respects its optional end date", () => {
  const schedule = { active: true, weekdays: [5], endsOn: "2026-11-13" };
  assert.equal(matchesWeeklySchedule("2026-11-13", schedule), true);
  assert.equal(matchesWeeklySchedule("2026-11-20", schedule), false);
});

test("inactive or invalid schedules never create availability", () => {
  assert.equal(matchesWeeklySchedule("2026-11-13", { active: false, weekdays: [5] }), false);
  assert.equal(matchesWeeklySchedule("not-a-date", { active: true, weekdays: [5] }), false);
});

test("weekday values are numeric, unique and sorted", () => {
  assert.deepEqual(normalizeWeekdays(["5", 1, "5", 0]), [0, 1, 5]);
});
