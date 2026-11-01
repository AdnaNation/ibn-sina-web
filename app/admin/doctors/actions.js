"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, hasPermission } from "@/lib/auth";
import { createDoctor, updateDoctor, deleteDoctor, importStarterDoctors } from "@/lib/doctors";

const g = (fd, k) => String(fd.get(k) || "").trim();
const fields = (fd) => ({
  name: g(fd, "name").slice(0, 80), nameBn: g(fd, "nameBn").slice(0, 80), department: g(fd, "department"),
  unit: g(fd, "unit"), phone: g(fd, "phone").slice(0, 18), featured: fd.get("featured") === "on",
});

async function guard() {
  const p = await getSession();
  if (!p || !hasPermission(p, "doctors.manage")) redirect("/admin/login");
  return p;
}
const done = (err, ok = "saved") => {
  revalidatePath("/admin/doctors"); revalidatePath("/doctors"); revalidatePath("/");
  redirect(err ? `/admin/doctors?err=${encodeURIComponent(err)}` : `/admin/doctors?ok=${ok}`);
};

export async function addDoctorAction(fd) { const p = await guard(); done(await createDoctor(p, fields(fd)), "created"); }
export async function saveDoctorAction(fd) { const p = await guard(); done(await updateDoctor(p, g(fd, "slug"), fields(fd)), "saved"); }
export async function deleteDoctorAction(fd) { const p = await guard(); done(await deleteDoctor(p, g(fd, "slug")), "deleted"); }
export async function importDoctorsAction() {
  const p = await guard();
  if (p.role !== "owner") redirect("/admin/doctors");
  done(await importStarterDoctors(p), "imported");
}
