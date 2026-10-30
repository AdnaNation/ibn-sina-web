"use server";
import { redirect } from "next/navigation";
import { getDoctor } from "@/lib/data";
import { book } from "@/lib/queue";
import { todayDhaka } from "@/lib/time";

export async function bookAppointment(_prev, formData) {
  const f = Object.fromEntries(formData);
  if (f.website) return {}; // honeypot: bots fill this hidden field

  const fail = (error) => ({ error, values: f });
  const name = String(f.name || "").trim();
  const phone = String(f.phone || "").replace(/[\s-]/g, "");
  const date = String(f.date || "");

  if (name.length < 3) return fail("Enter the patient’s full name.");
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone))
    return fail("Enter a valid mobile number, for example 01712345678.");
  const doctor = f.doctor ? await getDoctor(String(f.doctor)) : null;
  if (!doctor) return fail("Choose a doctor.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < todayDhaka() ||
    date > todayDhaka(14)
  ) {
    return fail("Choose a date within the next 14 days.");
  }

  const r = await book({
    doctor,
    date,
    name,
    phone,
    note: String(f.note || "").slice(0, 500),
  });
  if (r.error) return fail(r.error);
  redirect(`/track/${r.ref}?new=1`); // must stay outside try/catch
}
