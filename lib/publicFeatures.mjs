export function isPublicCancellationEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_CANCELLATION === "true";
}

export function isPublicBookingEnabled(env = process.env) {
  // The demo switch enables fictional-data bookings without authorizing real bookings.
  return env.ENABLE_PUBLIC_BOOKING === "true" || env.ENABLE_DEMO === "true";
}
