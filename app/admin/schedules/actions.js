"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, hasPermission, isBranchAdmin } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { publishSchedule, removeEmptySchedule } from "@/lib/queue";

const val = (fd, key) => String(fd.get(key) || "").trim();

export async function publishScheduleAction(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p) || hasPermission(p, "schedules.manage"))) redirect("/admin/login");

  const doctor = await getDoctor(val(fd, "doctorSlug"));
  let error = "";
  if (!doctor || (p.role !== "owner" && doctor.unit !== p.unit)) error = "Choose a valid doctor from your branch.";
  else {
    error = await publishSchedule({
      doctor,
      date: val(fd, "date"),
      startTime: val(fd, "startTime"),
      maxPatients: val(fd, "maxPatients"),
      avgMin: val(fd, "avgMin"),
      publishedBy: p.name || "Owner",
    });
  }

  revalidatePath("/admin/schedules");
  revalidatePath("/appointment");
  redirect(error
    ? `/admin/schedules?err=${encodeURIComponent(error)}`
    : `/admin/schedules?ok=published`);
}

export async function removeScheduleAction(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p) || hasPermission(p, "schedules.manage"))) redirect("/admin/login");
  const key = val(fd, "key");
  const { sessionDoc } = await import("@/lib/queue");
  const target = await sessionDoc(key);
  if (!target || (p.role !== "owner" && target.unit !== p.unit)) redirect("/admin/schedules?err=Not%20allowed");
  const error = await removeEmptySchedule(key);
  revalidatePath("/admin/schedules");
  revalidatePath("/appointment");
  redirect(error
    ? `/admin/schedules?err=${encodeURIComponent(error)}`
    : `/admin/schedules?ok=removed`);
}
