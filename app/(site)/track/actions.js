"use server";
import { headers } from "next/headers";
import { cancelAppt } from "@/lib/queue";
import { consumeRateLimit, requestFingerprint } from "@/lib/rateLimit";

export async function cancelAppointment(ref) {
  const value = String(ref || "").trim().toUpperCase();
  if (!/^IST-[A-Z0-9]{6}$/.test(value)) return { error: "Invalid tracking reference." };

  const requestHeaders = await headers();
  const ipLimit = await consumeRateLimit({ scope: "appointment-cancel-ip", key: requestFingerprint(requestHeaders), limit: 5 });
  if (!ipLimit.allowed) return { error: "Cancellation is temporarily unavailable. Please try again later." };

  const refLimit = await consumeRateLimit({ scope: "appointment-cancel-ref", key: value, limit: 3 });
  if (!refLimit.allowed) return { error: "Too many cancellation attempts for this tracking reference." };

  try {
    const result = await cancelAppt(value);
    if (!result?.ok) return { error: result?.error || "Cancellation could not be completed." };
    return { success: true };
  } catch (error) {
    console.error("[appointment] cancellation failed:", error?.message);
    return { error: "Cancellation could not be completed right now. Please try again later." };
  }
}
