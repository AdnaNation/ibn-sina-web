"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDoctor } from "@/lib/data";
import { book } from "@/lib/queue";
import { todayDhaka, isValidISODate } from "@/lib/time";
import { getLang } from "@/lib/i18n";
import { consumeRateLimit, requestFingerprint } from "@/lib/rateLimit";

export async function bookAppointment(_prev, formData) {
  const f = Object.fromEntries(formData);
  const lang = await getLang();
  const bn = lang === "bn";
  if (f.website) return {}; // honeypot: bots fill this hidden field

  const fail = (error) => ({ error, values: f });
  // A demonstration prototype must never collect real patient details by accident.
  // Enable only after written authorization, privacy review and production readiness.
  if (process.env.ENABLE_PUBLIC_BOOKING !== "true") {
    return fail(bn
      ? "এটি প্রদর্শনীমূলক প্রোটোটাইপ। বাস্তব রোগীর তথ্য বা বুকিং গ্রহণের জন্য অনুমোদিত নয়।"
      : "This is a demonstration prototype and is not authorized to accept real patient details or bookings.");
  }

  const requestHeaders = await headers();
  const ipLimit = await consumeRateLimit({ scope: "appointment-ip", key: requestFingerprint(requestHeaders), limit: 8 });
  if (ipLimit.unavailable) return fail(bn ? "সেবাটি সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন।" : "Booking is temporarily unavailable. Please try again later.");
  if (!ipLimit.allowed) return fail(bn ? "অনেকবার চেষ্টা করা হয়েছে। ১০ মিনিট পরে আবার চেষ্টা করুন।" : "Too many booking attempts. Please try again in about 10 minutes.");

  const name = String(f.name || "").trim();
  const phone = String(f.phone || "").replace(/[\s-]/g, "");
  const date = String(f.date || "");

  if (name.length < 3 || name.length > 100) return fail(bn ? "রোগীর পূর্ণ নাম লিখুন।" : "Enter the patient’s full name.");
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone))
    return fail(bn ? "সঠিক মোবাইল নম্বর লিখুন, যেমন 01712345678।" : "Enter a valid mobile number, for example 01712345678.");

  const phoneLimit = await consumeRateLimit({ scope: "appointment-phone", key: phone.replace(/^\+?88(?=01)/, ""), limit: 3 });
  if (phoneLimit.unavailable) return fail(bn ? "সেবাটি সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন।" : "Booking is temporarily unavailable. Please try again later.");
  if (!phoneLimit.allowed) return fail(bn ? "এই নম্বর থেকে সাময়িকভাবে বুকিং সীমা অতিক্রম হয়েছে। পরে আবার চেষ্টা করুন।" : "The booking attempt limit for this mobile number has been reached. Please try again later.");

  const doctor = f.doctor ? await getDoctor(String(f.doctor)) : null;
  if (!doctor) return fail(bn ? "একজন চিকিৎসক নির্বাচন করুন।" : "Choose a doctor.");
  if (
    !isValidISODate(date) ||
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
    return fail(bn ? "এই মুহূর্তে বুকিং সম্পন্ন করা যাচ্ছে না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।" : "We could not complete your booking right now. Please try again later.");
  }
  if (r.error) {
    const message = r.error.includes("No appointment schedule")
      ? (bn ? "এই তারিখে চিকিৎসকের সময়সূচি প্রকাশিত হয়নি। অন্য তারিখ নির্বাচন করুন।" : "No appointment schedule is published for this date. Choose another date.")
      : r.error.includes("All serials")
        ? (bn ? "এই দিনের সব সিরিয়াল পূর্ণ। অন্য তারিখ নির্বাচন করুন।" : "All serials for this date are taken. Please choose another date.")
        : r.error.includes("already has serial")
          ? (() => {
              const serial = r.error.match(/serial (\d+)/i)?.[1];
              return bn
                ? `এই মোবাইল নম্বরে ইতোমধ্যে সিরিয়াল ${serial || ""} রয়েছে।`
                : `This mobile number already has serial ${serial || ""} with this doctor.`;
            })()
          : r.error.includes("unavailable")
            ? (bn ? "অনলাইন বুকিং সাময়িকভাবে বন্ধ আছে। পরে আবার চেষ্টা করুন।" : "Online booking is temporarily unavailable. Please try again later.")
            : r.error;
    return fail(message);
  }
  redirect(`/track/${r.ref}?new=1`); // must stay outside try/catch
}
