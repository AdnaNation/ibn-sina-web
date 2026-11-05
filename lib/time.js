import { isValidISODate } from "./validation.mjs";
export { isValidISODate } from "./validation.mjs";

const TZ = "Asia/Dhaka";

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
