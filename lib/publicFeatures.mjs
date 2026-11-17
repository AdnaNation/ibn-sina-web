// This repository is an independent demo. Public booking is enabled by default;
// self-service cancellation requires an explicit opt-in.
export function isDemoEnvironment(env = process.env) {
  return env.ENABLE_DEMO === "true";
}

export function isPublicCancellationEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_CANCELLATION === "true";
}

export function isPublicBookingEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_BOOKING !== "false";
}
