export function isPublicCancellationEnabled(env = process.env) {
  return env.ENABLE_PUBLIC_CANCELLATION === "true";
}
