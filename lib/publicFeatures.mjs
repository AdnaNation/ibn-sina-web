// This repository is an independent demo. Public booking and cancellation
// are enabled by default for walkthroughs and can be disabled independently.
export function isDemoEnvironment(env = process.env) {
  return env.ENABLE_DEMO === "true";
}

export function isPublicCancellationEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_CANCELLATION !== "false";
}

export function isPublicBookingEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_BOOKING !== "false";
}
