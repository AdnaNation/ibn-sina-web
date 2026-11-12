import { MongoClient } from "mongodb";

const database = String(process.env.MONGODB_DB || "").trim();
const confirmation = String(process.env.DEMO_DATABASE_NAME || "").trim();
if (process.env.ENABLE_DEMO !== "true" || !database || database !== confirmation || !/(^|[_-])demo($|[_-])/i.test(database)) {
  console.error("Refusing to reset: this command requires the explicitly confirmed disposable demo database.");
  process.exit(1);
}
if (process.env.RESET_DEMO_ACTIVITY !== "true") {
  console.error("Set RESET_DEMO_ACTIVITY=true to confirm removal of demo queue sessions and demo appointments.");
  process.exit(1);
}
if (!process.env.MONGODB_URI) { console.error("Set MONGODB_URI."); process.exit(1); }

const client = await new MongoClient(process.env.MONGODB_URI).connect();
try {
  const db = client.db(database);
  const [appointments, sessions] = await Promise.all([
    db.collection("appointments").deleteMany({ demo: true }),
    db.collection("sessions").deleteMany({ demo: true }),
  ]);
  console.log(`Removed ${appointments.deletedCount} demo appointments and ${sessions.deletedCount} demo queue sessions from "${database}".`);
  console.log("Demo branch, doctor and login accounts were preserved.");
} finally {
  await client.close();
}
