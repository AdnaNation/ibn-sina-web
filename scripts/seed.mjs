import { MongoClient } from 'mongodb';
import { units, doctors, services, departments } from '../data/seed.mjs';

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('Set MONGODB_URI in .env.local'); process.exit(1); }

const client = await new MongoClient(uri).connect();
const db = client.db(process.env.MONGODB_DB || 'ibnsina');

for (const [name, docs, key] of [
  ['units', units, 'slug'], ['doctors', doctors, 'slug'],
  ['services', services, 'slug'], ['departments', departments, 'slug'],
]) {
  await db.collection(name).createIndex({ [key]: 1 }, { unique: true });
  await db.collection(name).bulkWrite(
    docs.map((d) => ({ replaceOne: { filter: { [key]: d[key] }, replacement: d, upsert: true } })),
  );
  console.log(`seeded ${name}: ${docs.length}`);
}
await db.collection('doctors').createIndex({ name: 'text', department: 'text', unit: 'text' });
await client.close();
