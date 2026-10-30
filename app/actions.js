"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLang(fd) {
  const lang = fd.get("lang") === "bn" ? "bn" : "en";
  (await cookies()).set("lang", lang, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
