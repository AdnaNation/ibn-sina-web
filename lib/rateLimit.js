// Small in-memory limiter for the staff sign-in form.
// It slows password guessing on a single server instance. If you deploy on
// several serverless instances, back this with MongoDB or Redis (see README).
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
