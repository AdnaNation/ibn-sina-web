import test from "node:test";
import assert from "node:assert/strict";
import { escapeRegex, isValidISODate, toCsv } from "../lib/validation.mjs";

test("strict ISO calendar dates accept real dates, including leap days", () => {
  assert.equal(isValidISODate("2024-02-29"), true);
  assert.equal(isValidISODate("2000-02-29"), true);
  assert.equal(isValidISODate("2025-01-01"), true);
});

test("strict ISO calendar dates reject impossible and malformed values", () => {
  for (const value of [
    "2025-02-29",
    "2025-02-31",
    "2025-13-01",
    "2025-00-10",
    "2025-04-31",
    "25-04-01",
    "2025/04/01",
    "２０２５-04-01",
    "",
    null,
    20250401,
  ]) {
    assert.equal(isValidISODate(value), false, String(value));
  }
});

test("regex search text is treated literally, not as a pattern", () => {
  const literal = "Dr. A (Cardio)+ [Unit]";
  const expression = new RegExp(escapeRegex(literal), "i");
  assert.equal(expression.test(literal), true);
  assert.equal(expression.test("DrX A Cardio Unit"), false);
});

test("CSV escapes quotes and neutralizes spreadsheet formulas", () => {
  const csv = toCsv([{
    date: "2025-04-01",
    serial: 7,
    ref: "IST-ABC123",
    name: '=HYPERLINK("https://bad.example","Open")',
    phone: "+8801700000000",
    doctor: "Dr. Example",
    department: "Medicine",
    unit: "Main, Dhaka",
    status: "waiting",
    walkIn: false,
    note: "@SUM(1,2)",
  }], { withPhone: true });

  assert.ok(csv.startsWith("\ufeff"));
  assert.ok(csv.includes(`'=HYPERLINK(""https://bad.example"",""Open"")`));
  assert.ok(csv.includes("'+8801700000000"));
  assert.ok(csv.includes("'@SUM(1,2)"));
  assert.ok(csv.includes('"Main, Dhaka"'));
});

test("CSV omits mobile column when patient contact export is not permitted", () => {
  const csv = toCsv([{
    date: "2025-04-01",
    serial: 1,
    ref: "IST-ABC123",
    name: "Restricted",
    phone: "01700000000",
    doctor: "Dr. Example",
    department: "Medicine",
    unit: "Main",
    status: "waiting",
  }], { withPhone: false });

  assert.equal(csv.split("\r\n")[0].includes('"Mobile"'), false);
  assert.equal(csv.includes("01700000000"), false);
});
