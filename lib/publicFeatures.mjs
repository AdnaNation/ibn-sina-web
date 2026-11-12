// Demo mode only enables presentation helpers in the admin UI.
// It never grants public booking or cancellation access.
export function isDemoEnvironment(env = process.env) {
  return env.ENABLE_DEMO === "true";
}

export function isPublicCancellationEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_CANCELLATION === "true";
}

export function isPublicBookingEnabled(env = process.env) {
  // Public booking is always an independent, explicit opt-in.
  return env.ENABLE_PUBLIC_BOOKING === "true";
}
