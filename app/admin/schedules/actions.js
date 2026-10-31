"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { publishSchedule, removeEmptySchedule } from "@/lib/queue";

const val = (fd, key) => String(fd.get(key) || "").trim();

export async function publishScheduleAction(fd) {
  const p = await getSession();
  if (p?.role !== "owner") redirect("/admin/login");

  const doctor = await getDoctor(val(fd, "doctorSlug"));
  let error = "";
  if (!doctor) error = "Choose a valid doctor from the list.";
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
  if (p?.role !== "owner") redirect("/admin/login");
  const error = await removeEmptySchedule(val(fd, "key"));
  revalidatePath("/admin/schedules");
  revalidatePath("/appointment");
  redirect(error
    ? `/admin/schedules?err=${encodeURIComponent(error)}`
    : `/admin/schedules?ok=removed`);
}
