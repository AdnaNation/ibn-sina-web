import { getDb } from "./mongodb";
import { isValidISODate } from "./time";
import { reportScope } from "./access.mjs";

export async function getOperationalReport(user, from, to) {
  if (!isValidISODate(from) || !isValidISODate(to) || from > to) return null;
  const span = (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
  if (span > 30) return null;

  let db;
  try { db = await getDb(); } catch (error) {
    console.error("[reports] database connection:", error?.message);
    return null;
  }
  if (!db) return null;
  const match = { ...reportScope(user), date: { $gte: from, $lte: to } };
  const appointments = db.collection("appointments");
  const sessions = db.collection("sessions");
  try {
    const [totalsRows, daily, doctors, sessionCount] = await Promise.all([
    appointments.aggregate([
      { $match: match },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        waiting: { $sum: { $cond: [{ $eq: ["$status", "waiting"] }, 1, 0] } },
        serving: { $sum: { $cond: [{ $eq: ["$status", "serving"] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        skipped: { $sum: { $cond: [{ $eq: ["$status", "skipped"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
      } },
    ]).toArray(),
    appointments.aggregate([
      { $match: match },
      { $group: {
        _id: "$date",
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        waiting: { $sum: { $cond: [{ $eq: ["$status", "waiting"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
      } },
      { $sort: { _id: 1 } },
    ]).toArray(),
    appointments.aggregate([
      { $match: match },
      { $group: {
        _id: { doctor: "$doctor", unit: "$unit" },
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        waiting: { $sum: { $cond: [{ $eq: ["$status", "waiting"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
      } },
      { $sort: { total: -1, "_id.doctor": 1 } },
      { $limit: 25 },
    ]).toArray(),
    sessions.countDocuments({ ...reportScope(user), date: { $gte: from, $lte: to } }),
  ]);

  const summary = totalsRows[0] || { total: 0, waiting: 0, serving: 0, done: 0, skipped: 0, cancelled: 0 };
    return {
      from,
      to,
      sessions: sessionCount,
      totals: summary,
      daily: daily.map((row) => ({ date: row._id, total: row.total, done: row.done, waiting: row.waiting, cancelled: row.cancelled })),
      doctors: doctors.map((row) => ({
        doctor: row._id?.doctor || "Unassigned",
        unit: row._id?.unit || "",
        total: row.total,
        done: row.done,
        waiting: row.waiting,
        cancelled: row.cancelled,
      })),
    };
  } catch (error) {
    console.error("[reports] aggregation:", error?.message);
    return null;
  }
}
