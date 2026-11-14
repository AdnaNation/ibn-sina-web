export const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function matchesWeeklySchedule(date, schedule) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !schedule?.active) return false;
  if (schedule.endsOn && date > schedule.endsOn) return false;
  const parsed = new Date(\${date}T12:00:00+06:00);
  if (Number.isNaN(parsed.getTime()) || parsed.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) !== date) return false;
  return Array.isArray(schedule.weekdays) && schedule.weekdays.includes(parsed.getDay());
}

export function normalizeWeekdays(values) {
  return [...new Set((values || []).map(Number))].sort((a, b) => a - b);
}
