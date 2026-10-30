"use server";
import { cancelAppt } from "@/lib/queue";

export async function cancelAppointment(ref) {
  await cancelAppt(ref);
}
