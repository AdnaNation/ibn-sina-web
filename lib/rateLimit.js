import { createHash } from "crypto";
import { getDb } from "@/lib/mongodb";

// In-memory limiter retained for the existing staff sign-in flow.
const buckets = global._ratebuckets ||= new Map();

export function checkLimit(key, { max = 5, windowMs = 10 * 60_000 } = {}) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset <= now) return { ok: true, left: max };
  return { ok: b.count < max, left: Math.max(0, max - b.count), retryAfterMin: Math.ceil((b.reset - now) / 60_000) };
}

export function recordFailure(key, { windowMs = 10 * 60_000 } = {}) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset <= now) buckets.set(key, { count: 1, reset: now + windowMs });
  else b.count++;
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
}

export function clearFailures(key) { buckets.delete(key); }

function hash(value) {
  return createHash("sha256").update(String(value || "unknown")).digest("hex");
}

export function requestFingerprint(requestOrHeaders) {
  const headers = requestOrHeaders?.headers || requestOrHeaders;
  const forwarded = headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers?.get?.("x-real-ip")?.trim();
  return hash(forwarded || real || "unknown");
}

let ttlIndex;
export async function consumeRateLimit({ scope, key, limit = 30, windowMs = 10 * 60_000 }) {
  const db = await getDb();
  if (!db) return { allowed: false, unavailable: true };

  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const id = `${scope}:${hash(key)}:${windowStart}`;
  const collection = db.collection("rate_limits");

  try {
    if (!ttlIndex) {
      ttlIndex = collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch((error) => {
        ttlIndex = null;
        throw error;
      });
    }
    await ttlIndex;
    await collection.updateOne(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { scope, windowStart: new Date(windowStart), expiresAt: new Date(windowStart + windowMs * 2) } },
      { upsert: true },
    );
    const record = await collection.findOne({ _id: id }, { projection: { count: 1 } });
    return { allowed: (record?.count || 0) <= limit, remaining: Math.max(0, limit - (record?.count || 0)), resetAt: windowStart + windowMs };
  } catch (error) {
    console.error("[rate-limit] counter:", error.message);
    return { allowed: false, unavailable: true };
  }
}
