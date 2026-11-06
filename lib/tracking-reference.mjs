import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// New references carry 60 bits of entropy. Six-character references remain
// valid so tickets issued before this change continue to work.
export function generateTrackingReference() {
  return "IST-" + Array.from(randomBytes(12), (byte) => ALPHABET[byte & 31]).join("");
}

export function isValidTrackingReference(value) {
  return typeof value === "string" && /^IST-(?:[A-Z0-9]{6}|[A-Z0-9]{12})$/i.test(value);
}
