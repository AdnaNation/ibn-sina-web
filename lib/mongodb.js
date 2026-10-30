import { MongoClient } from 'mongodb';

// One shared client across hot reloads (dev) and lambda invocations (prod).
let promise = global._mongoPromise;

export function getClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!promise) {
    promise = new MongoClient(uri).connect();
    global._mongoPromise = promise;
  }
  return promise;
}

export async function getDb() {
  const client = await getClient();
  return client ? client.db(process.env.MONGODB_DB || 'ibnsina') : null;
}
