import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, ShieldCheck, Stethoscope, Users, Building2, Search, FileText } from "lucide-react";
import { getLang } from "@/lib/i18n";

export const metadata = {
  title: "ব্যবহার নির্দেশিকা | User Manual",
  description: "হাসপাতাল ও সিরিয়াল ব্যবস্থাপনা প্রোটোটাইপ ব্যবহারের বাংলা নির্দেশিকা।",
};

const sections = [
  { id: "public", icon: Search, title: "সাধারণ ব্যবহারকারী", subtitle: "Public website", items: [
    ["চিকিৎসক খুঁজুন", "Doctors পেজে গিয়ে নাম, বিভাগ বা শাখা অনুযায়ী চিকিৎসক খুঁজুন। প্রোফাইলে প্রদর্শিত তথ্য ও প্রকাশিত সেশন দেখে নিন।"],
    ["শাখা ও সেবা দেখুন", "Units পেজে শাখার তথ্য এবং Services অংশে প্রদর্শিত সেবাগুলো দেখুন। তথ্যগুলো ডেমো ডেটা হতে পারে।"]
  ]},
  { id: "booking", icon: CalendarCheck, title: "অ্যাপয়েন্টমেন্ট বুকিং", subtitle: "Appointment booking", items: [
    ["১. শাখা ও চিকিৎসক নির্বাচন", "Appointment পেজে চাইলে আগে শাখা নির্বাচন করুন, এরপর চিকিৎসকের নাম, বিভাগ বা শাখা দিয়ে খুঁজুন। চিকিৎসকের কার্ডে চেম্বারের শাখা দেখে সঠিক চিকিৎসক নির্বাচন করুন।"],
    ["২. চিকিৎসক ও সেশন", "চিকিৎসক এবং প্রকাশিত তারিখ/সময় নির্বাচন করুন। কোনো সেশন প্রকাশিত না থাকলে বুকিং করা যাবে না।"],
    ["৩. তথ্য পূরণ", "রোগীর নাম ও বাংলাদেশের মোবাইল নম্বর দিন। 017…, 88017… অথবা +88017…—সব প্রচলিত ফরম্যাট গ্রহণ করা হয়। প্রদর্শনীর সময় অবশ্যই কাল্পনিক রোগীর তথ্য ব্যবহার করুন।"],
    ["৪. বুকিং নিশ্চিত", "তথ্য যাচাই করে বুকিং জমা দিন। সফল হলে প্রদর্শিত Tracking Reference লিখে রাখুন।"]
  ]},
  { id: "tracking", icon: ClipboardList, title: "ট্র্যাকিং ও লাইভ সিরিয়াল", subtitle: "Tracking & live queue", items: [
    ["অ্যাপয়েন্টমেন্ট ট্র্যাক", "Track পেজে বুকিংয়ের Tracking Reference লিখে অ্যাপয়েন্টমেন্টের অবস্থা দেখুন।"],
    ["লাইভ সিরিয়াল", "Live পেজে শাখা নির্বাচন করে চলমান সিরিয়াল দেখুন। একই ডিভাইসে নির্বাচিত শাখা পরবর্তীবার মনে রাখা হতে পারে।"],
    ["বাতিল", "Tracking পেজে রেফারেন্স দিয়ে অ্যাপয়েন্টমেন্ট খুঁজুন। Cancellation অপশন থাকলে তথ্য মিলিয়ে নির্দেশনা অনুসরণ করুন।"]
  ]},
  { id: "main-admin", icon: ShieldCheck, title: "Main Admin", subtitle: "Organization-wide administration", items: [
    ["ড্যাশবোর্ড", "সারসংক্ষেপ, শাখা ও কার্যক্রমের তথ্য পর্যালোচনা করুন। ডেমো সংখ্যাকে বাস্তব হাসপাতালের পরিসংখ্যান হিসেবে দেখাবেন না।"],
    ["চিকিৎসক ও সেশন", "চিকিৎসকের তথ্য এবং শিডিউল যাচাই/পরিচালনা করুন। রোগীর জন্য সেশন দেখাতে হলে প্রযোজ্য ক্ষেত্রে সেটি Publish করতে হবে।"],
    ["ব্যবহারকারী ও অনুমতি", "Branch Admin ও Staff অ্যাকাউন্ট পরিচালনা করুন। প্রত্যেককে তার কাজের জন্য প্রয়োজনীয় সর্বনিম্ন Role দিন।"],
    ["রিপোর্ট ও Audit", "রিপোর্ট এবং কার্যক্রমের লগ পর্যালোচনা করুন; ডেমো ডেটার সীমাবদ্ধতা মনে রাখুন।"]
  ]},
  { id: "branch-admin", icon: Building2, title: "Branch Admin", subtitle: "Branch-level administration", items: [
    ["নিজ শাখা", "নিজের Branch Admin অ্যাকাউন্ট দিয়ে প্রবেশ করে নির্ধারিত শাখার ড্যাশবোর্ড দেখুন।"],
    ["সেশন ও সিরিয়াল", "অনুমতি থাকলে নিজের শাখার চিকিৎসক সেশন পরিচালনা করুন এবং Live Queue পর্যবেক্ষণ করুন।"],
    ["Staff পরিচালনা", "নিজ শাখার Staff অ্যাকাউন্ট ও অনুমোদিত কাজ পরিচালনা করুন। অন্য শাখার তথ্য পরিবর্তনের অনুমতি নাও থাকতে পারে।"]
  ]},
  { id: "staff", icon: Users, title: "Staff", subtitle: "Daily operations", items: [
    ["লগইন", "নিজের Staff অ্যাকাউন্ট ব্যবহার করুন; অন্যের লগইন তথ্য ব্যবহার বা শেয়ার করবেন না।"],
    ["অ্যাপয়েন্টমেন্ট ও Queue", "নিজ শাখার তালিকা খুলে রোগীর দেওয়া তথ্যের সঙ্গে রেকর্ড মিলিয়ে নিন। আপনার Role-এ অনুমতি থাকলে অবস্থা আপডেট করুন।"],
    ["সমস্যা জানানো", "ভুল, ডুপ্লিকেট বা অস্বাভাবিক রেকর্ড দেখলে Branch Admin-কে জানান। কাজ শেষে Log out করুন।"]
  ]}
];

export default async function UserManualPage() {
  const bn = (await getLang()) === "bn";
  const t = (en, bangla) => bn ? bangla : en;
  return (
    <div className="bg-[#f7faf8]">
      <section className="bg-pine-950 px-4 py-14 text-white sm:py-18">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">{t("Temporary demo documentation", "অস্থায়ী ডেমো নির্দেশিকা")}</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">{t("User Manual", "ব্যবহার নির্দেশিকা")}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-pine-100 sm:text-base">{t("A practical guide for visitors, Main Admin, Branch Admin and Staff. This page is provided temporarily to help reviewers explore the prototype.", "সাধারণ ব্যবহারকারী, Main Admin, Branch Admin ও Staff-এর জন্য ধাপে ধাপে নির্দেশনা। প্রোটোটাইপটি সহজে পর্যালোচনার সুবিধার্থে পেজটি অস্থায়ীভাবে রাখা হয়েছে।")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/demo" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pine-950 hover:bg-emerald-50">{t("Demo guide", "ডেমো গাইড")} <ArrowRight size={16}/></Link>
            <Link href="/appointment" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">{t("Try appointment", "অ্যাপয়েন্টমেন্ট দেখুন")}</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <div className="flex items-center gap-2 font-bold"><ShieldCheck size={18}/> {t("Important demo notice", "গুরুত্বপূর্ণ ডেমো সতর্কতা")}</div>
          <p className="mt-2">{t("This is an independent, unauthorized prototype—not an official Ibn Sina Trust system. Demo bookings are saved only in the prototype database and are not sent to any real hospital. Use fictional data only; never enter real patient or medical information.", "এটি একটি স্বতন্ত্র ও অননুমোদিত প্রোটোটাইপ—ইবনে সিনা ট্রাস্টের অফিসিয়াল সিস্টেম নয়। ডেমো বুকিং শুধু প্রোটোটাইপের ডেটাবেজে সংরক্ষিত হয়; কোনো বাস্তব হাসপাতালে পাঠানো হয় না। শুধু কাল্পনিক তথ্য ব্যবহার করুন; বাস্তব রোগী বা চিকিৎসা-সংক্রান্ত তথ্য দেবেন না।")}</p>
        </div>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(({id, icon: Icon, title, subtitle}) => (
            <a key={id} href={`#${id}`} className="flex items-center gap-3 rounded-xl border border-pine-100 bg-white p-4 text-pine-950 shadow-sm transition hover:border-pine-300 hover:shadow-md">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-pine-800"><Icon size={19}/></span>
              <span><span className="block text-sm font-bold">{title}</span><span className="block text-xs text-slate-500">{subtitle}</span></span>
            </a>
          ))}
        </div>
        <div className="space-y-6">
          {sections.map(({id, icon: Icon, title, subtitle, items}) => (
            <section id={id} key={id} className="scroll-mt-28 rounded-2xl border border-pine-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3 border-b border-pine-100 pb-4">
                <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-pine-800"><Icon size={21}/></span>
                <div><h2 className="text-xl font-bold text-pine-950">{title}</h2><p className="text-xs text-slate-500">{subtitle}</p></div>
              </div>
              <div className="mt-5 space-y-5">
                {items.map(([heading, body], index) => (
                  <div key={heading} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-pine-50 text-xs font-bold text-pine-800">{index+1}</span>
                    <div><h3 className="font-bold text-pine-900">{heading}</h3><p className="mt-1 text-sm leading-7 text-slate-600">{body}</p></div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <section className="mt-8 rounded-2xl bg-pine-950 p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 font-bold"><FileText size={19}/>{t("Before presenting the prototype", "প্রোটোটাইপ দেখানোর আগে")}</div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-pine-100">
            <li>{t("Confirm demo logins and use fictional sample records only.", "ডেমো লগইন যাচাই করুন এবং শুধু কাল্পনিক তথ্য ব্যবহার করুন।")}</li>
            <li>{t("Make sure a doctor has a published session before demonstrating booking.", "বুকিং দেখানোর আগে কোনো চিকিৎসকের সেশন Publish করা আছে কি না নিশ্চিত করুন।")}</li>
            <li>{t("Explain that real deployment requires the institution's approval, security review and workflow validation.", "বাস্তব ব্যবহারের আগে প্রতিষ্ঠানের অনুমোদন, নিরাপত্তা যাচাই ও কার্যপ্রবাহ পর্যালোচনা প্রয়োজন—এটি পরিষ্কারভাবে বলুন।")}</li>
          </ul>
          <p className="mt-5 text-xs text-pine-200">{t("This is a temporary documentation page and can be removed after the authority review.", "কর্তৃপক্ষের পর্যালোচনা শেষে এই অস্থায়ী নির্দেশিকা পেজটি সরিয়ে ফেলা যাবে।")}</p>
        </section>
      </section>
    </div>
  );
}
