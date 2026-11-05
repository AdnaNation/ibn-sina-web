const TZ = "Asia/Dhaka";

export const isValidISODate = (value) => {
  if (typeof value !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
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
