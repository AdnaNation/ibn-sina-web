const TZ = "Asia/Dhaka";

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

export const todayDhaka = (offsetDays = 0) =>
  new Date(Date.now() + offsetDays * 864e5).toLocaleDateString("en-CA", {
    timeZone: TZ,
  }); // YYYY-MM-DD

export const startMs = (date, hhmm) =>
  new Date(`${date}T${hhmm}:00+06:00`).getTime();

export const fmtTime = (ms) =>
  new Date(ms)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TZ,
    })
    .replace(/\u202f/g, " ");

export const fmtDate = (date) =>
  new Date(`${date}T12:00:00+06:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
