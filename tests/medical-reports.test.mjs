import test from "node:test";
import assert from "node:assert/strict";

const ID = /^MR-[A-F0-9]{16}$/;
test("medical report IDs use a fixed, non-guessable format", () => {
  assert.equal(ID.test("MR-0123456789ABCDEF"), true);
  assert.equal(ID.test("MR-0123456789abcdef"), false);
  assert.equal(ID.test("MR-123"), false);
  assert.equal(ID.test("MR-0123456789ABCDEFX"), false);
});
