"use server";

import { revalidatePath } from "next/cache";
import { getSession, hasPermission, isBranchAdmin } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { publishSchedule, saveWeeklySchedule, deactivateWeeklySchedule, removeEmptySchedule } from "@/lib/queue";
import { writeAudit } from "@/lib/management";

const val = (fd, key) => String(fd.get(key) || "").trim();

export async function publishScheduleAction(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p) || hasPermission(p, "schedules.manage"))) return { error: "Your session expired or you do not have permission." };

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

  if (!error) await writeAudit({ actor: p, action: "schedule.published", targetType: "schedule", targetId: doctor.slug + "|" + val(fd, "date"), details: { doctor: doctor.name, unit: doctor.unit, date: val(fd, "date") } });
  revalidatePath("/admin/schedules");
  revalidatePath("/appointment");
  if (error) return { error };
  return { success: true };
}

export async function saveWeeklyScheduleAction(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p) || hasPermission(p, "schedules.manage"))) return { error: "Your session expired. Please sign in again." };
  const doctor = await getDoctor(val(fd, "doctorSlug"));
  let error = "";
  if (!doctor || (p.role !== "owner" && doctor.unit !== p.unit)) error = "Choose a valid doctor from your branch.";
  else {
    error = await saveWeeklySchedule({
      doctor,
      weekdays: fd.getAll("weekdays"),
      startTime: val(fd, "weeklyStartTime"),
      endTime: val(fd, "weeklyEndTime"),
      maxPatients: val(fd, "weeklyMaxPatients"),
      avgMin: val(fd, "weeklyAvgMin"),
      endsOn: val(fd, "endsOn"),
      publishedBy: p.name || "Owner",
    });
  }
  if (!error) await writeAudit({
    actor: p, action: "schedule.weekly_saved", targetType: "weekly_schedule",
    targetId: doctor.slug,
    details: { doctor: doctor.name, unit: doctor.unit, weekdays: fd.getAll("weekdays") },
  });
  if (error) return { error };
  revalidatePath("/admin/schedules");
  revalidatePath("/appointment");
  return { success: true };
}

export async function disableWeeklyScheduleAction(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p) || hasPermission(p, "schedules.manage"))) return { error: "Your session expired or you do not have permission." };
  const doctorSlug = val(fd, "doctorSlug");
  const doctor = await getDoctor(doctorSlug);
  if (!doctor || (p.role !== "owner" && doctor.unit !== p.unit)) return { error: "Not allowed to change this doctor’s schedule." };
  const error = await deactivateWeeklySchedule(doctorSlug, p);
  if (!error) await writeAudit({ actor: p, action: "schedule.weekly_disabled", targetType: "weekly_schedule", targetId: doctorSlug });
  revalidatePath("/admin/schedules");
  revalidatePath("/appointment");
  if (error) return { error };
  return { success: true };
}

export async function removeScheduleAction(fd) {
  const p = await getSession();
  if (!p || !(p.role === "owner" || isBranchAdmin(p) || hasPermission(p, "schedules.manage"))) return { error: "Your session expired or you do not have permission." };
  const key = val(fd, "key");
  const { sessionDoc } = await import("@/lib/queue");
  const target = await sessionDoc(key);
  if (!target || (p.role !== "owner" && target.unit !== p.unit)) return { error: "Not allowed to remove this schedule." };
  const error = await removeEmptySchedule(key);
  if (!error) await writeAudit({ actor: p, action: "schedule.removed", targetType: "schedule", targetId: key });
  revalidatePath("/admin/schedules");
  revalidatePath("/appointment");
  if (error) return { error };
  return { success: true };
}
