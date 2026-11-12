import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const VALID = /^IST-[A-Z0-9]{6}(?:[A-Z0-9]{6})?$/;

export function generateTrackingReference() {
  const bytes = randomBytes(12);
  let suffix = "";
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
  return `IST-${suffix}`;
}

export function isValidTrackingReference(value) {
  return typeof value === "string" && VALID.test(value.trim().toUpperCase());
}
