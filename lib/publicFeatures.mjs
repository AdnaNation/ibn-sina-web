export function isDemoEnvironment(env = process.env) {
  const database = typeof env.MONGODB_DB === "string" ? env.MONGODB_DB.trim() : "";
  const confirmation = typeof env.DEMO_DATABASE_NAME === "string" ? env.DEMO_DATABASE_NAME.trim() : "";
  return env.ENABLE_DEMO === "true" &&
    database.length > 0 &&
    database === confirmation &&
    /(^|[_-])demo($|[_-])/i.test(database);
}

export function isPublicCancellationEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_CANCELLATION === "true";
}

export function isPublicBookingEnabled(env = process.env) {
  // Demo bookings require an explicit, separately named disposable database.
  return env.ENABLE_PUBLIC_BOOKING === "true" || isDemoEnvironment(env);
}
