"use server";
import { redirect } from "next/navigation";
import { getDoctor } from "@/lib/data";
import { book } from "@/lib/queue";
import { todayDhaka } from "@/lib/time";
import { getLang } from "@/lib/i18n";

export async function bookAppointment(_prev, formData) {
  const f = Object.fromEntries(formData);
  const lang = await getLang();
  const bn = lang === "bn";
  if (f.website) return {}; // honeypot: bots fill this hidden field

  const fail = (error) => ({ error, values: f });
  const name = String(f.name || "").trim();
  const phone = String(f.phone || "").replace(/[\s-]/g, "");
  const date = String(f.date || "");

  if (name.length < 3) return fail(bn ? "রোগীর পূর্ণ নাম লিখুন।" : "Enter the patient’s full name.");
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone))
    return fail(bn ? "সঠিক মোবাইল নম্বর লিখুন, যেমন 01712345678।" : "Enter a valid mobile number, for example 01712345678.");
  const doctor = f.doctor ? await getDoctor(String(f.doctor)) : null;
  if (!doctor) return fail(bn ? "একজন চিকিৎসক নির্বাচন করুন।" : "Choose a doctor.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < todayDhaka() ||
    date > todayDhaka(14)
  ) {
    return fail(bn ? "আগামী ১৪ দিনের মধ্যে একটি তারিখ নির্বাচন করুন।" : "Choose a date within the next 14 days.");
  }

  let r;
  try {
    r = await book({
      doctor,
      date,
      name: name.slice(0, 100),
      phone,
      note: String(f.note || "").slice(0, 500),
    });
  } catch (error) {
    console.error("[appointment] booking failed:", error?.message);
    return fail(bn ? "এই মুহূর্তে বুকিং সম্পন্ন করা যাচ্ছে না। অনুগ্রহ করে ১০৬১৫ নম্বরে কল করুন।" : "We could not complete your booking right now. Please call 10615.");
  }
  if (r.error) {
    const message = r.error.includes("No appointment schedule")
      ? (bn ? "এই তারিখে চিকিৎসকের সময়সূচি প্রকাশিত হয়নি। অন্য তারিখ নির্বাচন করুন অথবা ১০৬১৫ নম্বরে কল করুন।" : "No appointment schedule is published for this date. Choose another date or call 10615.")
      : r.error.includes("All serials")
        ? (bn ? "এই দিনের সব সিরিয়াল পূর্ণ। অন্য তারিখ নির্বাচন করুন।" : "All serials for this date are taken. Please choose another date.")
        : r.error.includes("already has serial")
          ? (() => {
              const serial = r.error.match(/serial (\d+)/i)?.[1];
              const ref = r.error.match(/Tracking code: ([A-Z0-9-]+)/i)?.[1];
              return bn
                ? `এই মোবাইল নম্বরে ইতোমধ্যে সিরিয়াল ${serial || ""} রয়েছে। ${ref ? `ট্র্যাকিং কোড: ${ref}` : ""}`
                : r.error;
            })()
          : r.error.includes("unavailable")
            ? (bn ? "অনলাইন বুকিং সাময়িকভাবে বন্ধ আছে। সহায়তার জন্য ১০৬১৫ নম্বরে কল করুন।" : r.error)
            : r.error;
    return fail(message);
  }
  redirect(`/track/${r.ref}?new=1`); // must stay outside try/catch
}
