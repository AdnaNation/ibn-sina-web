"use server";

import { cookies } from "next/headers";

export async function setLang(formData) {
  const selectedLang = formData.get("lang");

  // Accept only supported languages
  if (selectedLang !== "en" && selectedLang !== "bn") {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set("lang", selectedLang, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
