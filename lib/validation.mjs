export const isValidISODate = (value) => {
  if (typeof value !== "string" || value.length !== 10) return false;
  const parts = value.split("-");
  if (parts.length !== 3 || parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) return false;
  if (!parts.every((part) => [...part].every((char) => char >= "0" && char <= "9"))) return false;
  const [year, month, day] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
};

export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Spreadsheet cells beginning with formula operators must be neutralized.
const csvCell = (value) => {
  let cell = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(cell)) cell = "'" + cell;
  return `"${cell.replace(/"/g, '""')}"`;
};

export function toCsv(rows, { withPhone = false } = {}) {
  const head = ["Date", "Serial", "Tracking code", "Patient", ...(withPhone ? ["Mobile"] : []), "Doctor", "Department", "Branch", "Status", "Walk-in", "Note"];
  const lines = rows.map((row) => [
    row.date,
    row.serial,
    row.ref,
    row.name,
    ...(withPhone ? [row.phone] : []),
    row.doctor,
    row.department,
    row.unit,
    row.status,
    row.walkIn ? "yes" : "no",
    row.note || "",
  ].map(csvCell).join(","));
  return "\ufeff" + [head.map(csvCell).join(","), ...lines].join("\r\n");
}
