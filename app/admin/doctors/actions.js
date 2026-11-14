"use server";
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
  if (!p || !hasPermission(p, "doctors.manage")) throw new Error("Your session expired or you do not have permission.");
  return p;
}
const done = (error) => {
  if (error) return { error };
  revalidatePath("/admin/doctors"); revalidatePath("/doctors"); revalidatePath("/");
  return { success: true };
};

export async function addDoctorAction(fd) { const p = await guard(); return done(await createDoctor(p, fields(fd))); }
export async function saveDoctorAction(fd) { const p = await guard(); return done(await updateDoctor(p, g(fd, "slug"), fields(fd))); }
export async function deleteDoctorAction(fd) { const p = await guard(); return done(await deleteDoctor(p, g(fd, "slug"))); }
export async function importDoctorsAction() {
  const p = await getSession();
  if (!p || p.role !== "owner") return { error: "Only the Main Admin can import the initial starter directory." };
  return done(await importStarterDoctors(p));
}
