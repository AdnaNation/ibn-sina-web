import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { getLang } from "@/lib/i18n";

export default async function Footer() {
  const lang = await getLang();
  const bn = lang === "bn";
  const links = bn
    ? [["ডাক্তার খুঁজুন", "/doctors"], ["সেবাসমূহ", "/#services"], ["শাখাসমূহ", "/units"], ["অ্যাপয়েন্টমেন্ট", "/appointment"], ["সিরিয়াল ট্র্যাক", "/track"], ["ব্যবহার নির্দেশিকা", "/user-manual"], ["মেডিকেল রিপোর্ট", "/medical-reports"]]
    : [["Find a doctor", "/doctors"], ["Services", "/#services"], ["Locations", "/units"], ["Appointment", "/appointment"], ["Track queue", "/track"], ["User manual", "/user-manual"], ["Medical reports", "/medical-reports"]];

  return (
    <footer className="bg-[#062d23] text-pine-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_.8fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-white"><HeartPulse size={24} /></span>
            <span className="font-serif text-2xl font-semibold text-white">{bn ? "স্বাস্থ্যসেবা প্রোটোটাইপ" : "Healthcare Prototype"}</span>
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-7 text-pine-100/75">
            {bn
              ? "এটি একটি স্বাধীন প্রদর্শনীমূলক ধারণা। ইবনে সিনা ট্রাস্ট বা অন্য কোনো হাসপাতালের সঙ্গে এর আনুষ্ঠানিক সম্পর্ক বা অনুমোদন নেই।"
              : "An independent demonstration concept. It is not affiliated with or authorized by Ibn Sina Trust or any other hospital."}
          </p>
        </div>
        <nav aria-label={bn ? "দ্রুত লিংক" : "Quick links"}>
          <h2 className="text-xs font-bold uppercase tracking-[.18em] text-white">{bn ? "দ্রুত লিংক" : "Explore"}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 text-sm text-pine-100/75">
            {links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>)}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 px-4 py-5">
        <p className="mx-auto max-w-4xl text-center text-[11px] leading-5 text-pine-100/65">
          {bn
            ? "প্রদর্শিত চিকিৎসক, শাখা, সময়সূচি ও অন্যান্য তথ্য বাস্তব ব্যবহারের আগে সংশ্লিষ্ট প্রতিষ্ঠানের অনুমোদিত তথ্য দিয়ে যাচাই করতে হবে। জরুরি অবস্থায় অনলাইন সিরিয়ালের ওপর নির্ভর করবেন না।"
            : "Doctors, locations, schedules and other displayed information must be verified against institution-approved sources before real-world use. Do not rely on online queue information in an emergency."}
        </p>
        <p className="mt-2 text-center text-[11px] text-pine-100/50">© {new Date().getFullYear()} {bn ? "স্বাধীন প্রোটোটাইপ" : "Independent prototype"}</p>
        <p className="mt-2 text-center text-xs text-pine-100/65">
          Developed by{" "}
          <a
            href="https://azizul-islam-adnan.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline-offset-4 transition hover:text-pine-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            ADNAN
          </a>
        </p>
      </div>
    </footer>
  );
}
