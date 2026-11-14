"use server";
import { revalidatePath } from "next/cache";
import { getSession, hasPermission } from "@/lib/auth";
import { cancelByStaff } from "@/lib/appointments";
export async function cancelAppointmentAction(fd) {
  const p = await getSession();
  if (!p || !hasPermission(p, "appointments.manage")) return { error: "Your session expired or you do not have permission." };
  const error = await cancelByStaff(p, String(fd.get("ref") || ""));
  if (error) return { error };
  revalidatePath("/admin/appointments");
  revalidatePath("/admin/queue");
  return { success: true };
}
