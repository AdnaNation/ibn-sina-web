import test from "node:test";
import assert from "node:assert/strict";

const isMedicalReportId = (value) =>
  typeof value === "string" && /^MR-[A-F0-9]{16}$/.test(value.trim().toUpperCase());

test("medical report IDs use a fixed, non-guessable format", () => {
  assert.equal(isMedicalReportId("MR-0123456789ABCDEF"), true);
  assert.equal(isMedicalReportId("mr-0123456789abcdef"), true);
  assert.equal(isMedicalReportId("MR-123"), false);
  assert.equal(isMedicalReportId("MR-0123456789ABCDEFX"), false);
  assert.equal(isMedicalReportId("MR-0123456789ABCDEG"), false);
});
