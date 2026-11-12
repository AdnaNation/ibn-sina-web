import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "node:crypto";

const database = String(process.env.MONGODB_DB || "").trim();
const confirmation = String(process.env.DEMO_DATABASE_NAME || "").trim();
if (process.env.ENABLE_DEMO !== "true" || !database || database !== confirmation || !/(^|[_-])demo($|[_-])/i.test(database)) {
  console.error("Refusing to seed: set ENABLE_DEMO=true and make DEMO_DATABASE_NAME exactly match a dedicated MONGODB_DB containing 'demo'.");
  process.exit(1);
}
const uri = process.env.MONGODB_URI;
if (!uri) { console.error("Set MONGODB_URI."); process.exit(1); }

const accounts = [
  {
    username: process.env.DEMO_BRANCH_ADMIN_USERNAME,
    password: process.env.DEMO_BRANCH_ADMIN_PASSWORD,
    name: "Demo Branch Administrator",
    role: "branch_admin",
    permissions: ["appointments.view", "appointments.manage", "patients.view", "queue.manage", "schedules.manage", "doctors.view", "doctors.manage", "reports.view"],
  },
  {
    username: process.env.DEMO_STAFF_USERNAME,
    password: process.env.DEMO_STAFF_PASSWORD,
    name: "Demo Queue Staff",
    role: "staff",
    permissions: ["appointments.view", "patients.view", "queue.manage", "reports.view"],
  },
];
for (const account of accounts) {
  if (!/^[a-z0-9._-]{3,20}$/.test(String(account.username || "").toLowerCase()) ||
      !account.password || account.password.length < 16 || account.password.length > 128) {
    console.error("Provide valid DEMO_BRANCH_ADMIN_USERNAME/PASSWORD and DEMO_STAFF_USERNAME/PASSWORD. Passwords must be 16–128 characters.");
    process.exit(1);
  }
}

const client = await new MongoClient(uri).connect();
try {
  const db = client.db(database);
  const unit = {
    slug: "prototype-demo-clinic-demo-city",
    name: "Prototype Demo Clinic",
    area: "Demo District",
    city: "Demo City",
    type: "Demonstration clinic",
    hotline: "",
    address: "Fictional sample location — not a real healthcare facility",
    order: 9999,
    active: true,
    demoData: true,
  };
  const unitLabel = `${unit.name}, ${unit.area}`;
  await db.collection("units").updateOne({ slug: unit.slug }, { $set: unit }, { upsert: true });
  await db.collection("doctors").updateOne(
    { slug: "demo-doctor" },
    { $set: {
      slug: "demo-doctor",
      name: "Dr. Ayesha Rahman (Demo)",
      nameBn: "ডা. আয়েশা রহমান (ডেমো)",
      department: "Medicine",
      unit: unitLabel,
      phone: "",
      photo: null,
      featured: true,
      demoData: true,
    } },
    { upsert: true },
  );
  const staff = db.collection("staff");
  await staff.createIndex({ username: 1 }, { unique: true });
  for (const account of accounts) {
    const username = account.username.toLowerCase();
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(account.password, salt, 32).toString("hex");
    await staff.updateOne(
      { username },
      { $set: {
        username, name: account.name, role: account.role, unit: unitLabel,
        doctorSlug: "", doctorName: "", permissions: account.permissions,
        active: true, salt, hash, demoAccount: true, updatedAt: new Date(),
      }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
    console.log(`Prepared demo role: ${account.role} (${username})`);
  }
  console.log(`Demo directory ready in database "${database}".`);
  console.log("Next: sign in as Main Admin, open /admin, and use Load demo clinic to create fictional queue activity.");
} finally {
  await client.close();
}
