"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { createStaff, deleteStaff } from "@/lib/staff";

const g = (fd, k) => String(fd.get(k) || "").trim();

export async function addStaff(fd) {
  if ((await getSession())?.role !== "owner") redirect("/admin/login");
  const name = g(fd, "name"),
    username = g(fd, "username").toLowerCase(),
    password = g(fd, "password");
  const [kind, value] = g(fd, "scope").split(/:(.+)/);

  let err = "";
  if (name.length < 2) err = "Enter the staff member’s name.";
  else if (!/^[a-z0-9._-]{3,20}$/.test(username) || username === "admin")
    err = "Username: 3 to 20 letters or numbers, no spaces.";
  else if (password.length < 6) err = "Password must be at least 6 characters.";
  else if (kind === "branch" && value)
    err = await createStaff({
      name,
      username,
      password,
      role: "branch",
      unit: value,
    });
  else if (kind === "doctor" && value) {
    const d = await getDoctor(value);
    err = d
      ? await createStaff({
          name,
          username,
          password,
          role: "doctor",
          doctorSlug: d.slug,
          doctorName: d.name,
        })
      : "Choose a doctor.";
  } else err = "Choose a branch or a doctor.";

  revalidatePath("/admin/staff");
  redirect(
    err
      ? `/admin/staff?err=${encodeURIComponent(err)}`
      : `/admin/staff?ok=${encodeURIComponent(username)}`,
  );
}

export async function removeStaff(fd) {
  if ((await getSession())?.role !== "owner") return;
  await deleteStaff(g(fd, "username"));
  revalidatePath("/admin/staff");
}
