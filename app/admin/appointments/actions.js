"use server";
import { redirect } from "next/navigation";
import { getSession, hasPermission } from "@/lib/auth";
import { cancelByStaff } from "@/lib/appointments";

export async function cancelAppointmentAction(fd) {
  const p = await getSession();
  if (!p || !hasPermission(p, "appointments.manage")) redirect("/admin/login");
  const back = String(fd.get("back") || "/admin/appointments");
  const safeBack = back.startsWith("/admin/appointments") ? back : "/admin/appointments";
  const err = await cancelByStaff(p, String(fd.get("ref") || ""));
  const sep = safeBack.includes("?") ? "&" : "?";
  redirect(err ? `${safeBack}${sep}err=${encodeURIComponent(err)}` : `${safeBack}${sep}ok=cancelled`);
}
