import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, ClipboardList, HeartPulse, MapPin, Stethoscope, Users } from "lucide-react";
import { getLang } from "@/lib/i18n";

export const metadata = {
  title: "Explore the Demo",
  description: "A simple guide to exploring this independent hospital website and queue-system prototype.",
};

const cards = [
  { href: "/doctors", icon: Stethoscope, en: "Doctors", bn: "ডাক্তার", desc: "Browse doctor profiles and specialties.", descBn: "ডাক্তারের প্রোফাইল ও বিশেষত্ব দেখুন।" },
  { href: "/units", icon: MapPin, en: "Branches", bn: "শাখা", desc: "Explore locations and branch information.", descBn: "শাখা ও অবস্থানের তথ্য দেখুন।" },
  { href: "/#services", icon: HeartPulse, en: "Services", bn: "সেবাসমূহ", desc: "See the services presented on the homepage.", descBn: "হোমপেজে দেখানো সেবাগুলো দেখুন।" },
  { href: "/appointment", icon: CalendarDays, en: "Appointments", bn: "অ্যাপয়েন্টমেন্ট", desc: "View the appointment flow. Demo appointments can be booked when a published doctor session is available.", descBn: "অ্যাপয়েন্টমেন্ট প্রক্রিয়া দেখুন। প্রকাশিত চিকিৎসক সেশন থাকলে ডেমো অ্যাপয়েন্টমেন্ট বুক করা যাবে।" },
  { href: "/live", icon: ClipboardList, en: "Live Queue", bn: "লাইভ সিরিয়াল", desc: "See the public queue display when demo data is loaded.", descBn: "ডেমো তথ্য লোড থাকলে লাইভ সিরিয়াল দেখুন।" },
  { href: "/track", icon: Users, en: "Track a Ticket", bn: "টিকিট ট্র্যাক", desc: "Check a demo appointment using its sample reference.", descBn: "নমুনা রেফারেন্স দিয়ে ডেমো অ্যাপয়েন্টমেন্ট দেখুন।" },
];

export default async function DemoGuidePage() {
  const bn = (await getLang()) === "bn";
  const t = (en, bangla) => (bn ? bangla : en);

  return (
    <div className="bg-[#f7faf8]">
      <section className="bg-pine-950 px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">{t("A simple walkthrough", "সহজ পরিচিতি")}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">{t("Explore the website", "ওয়েবসাইট ঘুরে দেখুন")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-pine-100 sm:text-base">
            {t("Choose any section below. You can explore the public pages without signing in.", "নিচের যেকোনো বিভাগ বেছে নিন। কোনো অ্যাকাউন্টে সাইন ইন না করেই পাবলিক পেজগুলো দেখতে পারবেন।")}
          </p>
          <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pine-950 transition hover:bg-emerald-50">
            {t("Back to homepage", "হোমপেজে ফিরুন")} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ href, icon: Icon, en, bn: labelBn, desc, descBn }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-pine-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-pine-300 hover:shadow-md">
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-pine-800"><Icon size={21} /></span>
              <h2 className="mt-4 text-lg font-bold text-pine-950">{t(en, labelBn)}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t(desc, descBn)}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800">{t("Explore", "দেখুন")} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-pine-100 bg-white p-6">
            <div className="flex items-center gap-3"><Building2 className="text-pine-800" size={21} /><h2 className="text-lg font-bold text-pine-950">{t("Staff dashboard", "স্টাফ ড্যাশবোর্ড")}</h2></div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("Admin, Branch Admin and Staff areas need separate demo login details. Ask the person who shared this demo for the credentials.", "অ্যাডমিন, শাখা অ্যাডমিন ও স্টাফ অংশে ঢুকতে আলাদা ডেমো লগইন দরকার। যিনি ডেমো লিংক দিয়েছেন, তাঁর কাছ থেকে লগইন তথ্য নিন।")}</p>
            <Link href="/admin/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-pine-900 px-5 py-3 text-sm font-bold text-white hover:bg-pine-800">{t("Staff sign in", "স্টাফ সাইন ইন")} <ArrowRight size={15} /></Link>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-amber-950">{t("Please note", "দয়া করে মনে রাখুন")}</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">{t("This is an independent demonstration prototype, not an official hospital website or booking service. All sample records are for demonstration only. Do not enter real patient information. Public booking remains disabled unless separately authorized and configured.", "এটি একটি স্বাধীন প্রদর্শনীমূলক প্রোটোটাইপ; কোনো হাসপাতালের আনুষ্ঠানিক ওয়েবসাইট বা বুকিং সেবা নয়। নমুনা তথ্য শুধু প্রদর্শনের জন্য। প্রকৃত রোগীর তথ্য দেবেন না। আলাদা অনুমোদন ও সেটআপ ছাড়া পাবলিক বুকিং বন্ধ থাকবে।")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
