import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "node:crypto";
import { doctors } from "../data/seed.mjs";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required for isolated E2E fixtures.");
const doctor = doctors.find((item) => item.unit.includes("Chattogram"));
if (!doctor) throw new Error("Expected a Chattogram fixture doctor.");

const client = await new MongoClient(uri).connect();
try {
  const db = client.db(process.env.MONGODB_DB || "ibnsina_queue_test");
  const staff = db.collection("staff");
  await staff.createIndex({ username: 1 }, { unique: true });
  await staff.createIndex({ unit: 1, role: 1 });
  const password = "E2E-only-demo-password-2026";
  const users = [
    { username: "branchadmin", name: "E2E Branch Admin", role: "branch_admin", permissions: [] },
    { username: "queuestaff", name: "E2E Queue Staff", role: "staff", permissions: ["queue.manage"] },
    { username: "apptstaff", name: "E2E Appointment Staff", role: "staff", permissions: ["appointments.view"] },
  ];
  for (const user of users) {
    const salt = randomBytes(16).toString("hex");
    await staff.deleteOne({ username: user.username });
    await staff.insertOne({
      ...user, unit: doctor.unit, doctorSlug: doctor.slug,
      doctorSlugs: [doctor.slug], allDoctors: false, doctorName: doctor.name,
      active: true, salt, hash: scryptSync(password, salt, 32).toString("hex"),
      createdAt: new Date(),
    });
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type)?.value;
  const date = part("year") + "-" + part("month") + "-" + part("day");
  const key = doctor.slug + "|" + date;
  const ref = "IST-E2EABC123456";
  await db.collection("sessions").updateOne({ key }, { $set: {
    key, date, doctorSlug: doctor.slug, doctorName: doctor.name,
    department: doctor.department, unit: doctor.unit,
    startTime: "08:00", endTime: "20:00", maxPatients: 40,
    avgMin: 8, delayMin: 0, notice: "", status: "in_progress",
    current: 0, lastSerial: 1, createdAt: new Date(),
  } }, { upsert: true });
  await db.collection("appointments").deleteOne({ ref });
  await db.collection("appointments").insertOne({
    ref, sessionKey: key, doctorSlug: doctor.slug, doctor: doctor.name,
    department: doctor.department, unit: doctor.unit, date, serial: 1,
    name: "Fictional E2E Patient", phone: "01700000000",
    note: "E2E-only private note", walkIn: false, status: "waiting",
    createdAt: new Date(),
  });
  console.log("Created isolated fictional E2E accounts and queue fixture.");
} finally {
  await client.close();
}
