import { ArrowUpRight, HeartPulse } from "lucide-react";
import { getT } from "@/lib/i18n";
import { setLang } from "@/app/actions";
import Link from "next/link";
import MobileNavMenu from "@/components/MobileNavMenu";
import PublicNavDropdown from "@/components/PublicNavDropdown";

export default async function Navbar() {
  const { lang, t } = await getT();
  const bn = lang === "bn";
  const prototypeName = bn ? "স্বাস্থ্যসেবা প্রোটোটাইপ" : "Healthcare Prototype";

  const links = [
    [t.nav[0], "/doctors"],
    [t.nav[1], "/#services"],
    [t.nav[2], "/units"],
    [t.nav[5], "/live"],
    [bn ? "ডেমো গাইড" : "Demo guide", "/demo"],
    [bn ? "ব্যবহার নির্দেশিকা" : "User manual", "/user-manual"],
    [bn ? "মেডিকেল রিপোর্ট" : "Medical reports", "/medical-reports"],
  ];

  const primaryLinks = [links[0], links[3]];
  const groups = [
    {
      label: bn ? "সেবা ও শাখা" : "Explore",
      links: [links[1], links[2]],
    },
    {
      label: bn ? "সহায়িকা" : "Resources",
      links: [links[4], links[5], links[6]],
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-pine-100/80 bg-white">
      <nav aria-label={bn ? "প্রধান নেভিগেশন" : "Main navigation"} className="flex h-[72px] w-full items-center justify-between gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
        <Link href="/" prefetch={true} className="group flex min-w-0 items-center gap-3" aria-label={prototypeName + " home"}>
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-pine-900 text-white transition">
            <HeartPulse size={25} strokeWidth={2.1} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-serif text-[19px] font-semibold leading-tight text-pine-950 sm:text-[21px]">{prototypeName}</span>
          </span>
        </Link>

        <div className="hidden min-w-0 items-center gap-5 xl:flex">
          {primaryLinks.map(([label, href]) => (
            <Link key={href} href={href} prefetch={true} className="whitespace-nowrap text-[13px] font-medium text-slate-600 transition hover:text-pine-800">{label}</Link>
          ))}
          {groups.map((group) => (
            <PublicNavDropdown key={group.label} group={group} bn={bn} />
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <Link href="/track" prefetch={true} className="whitespace-nowrap text-[13px] font-medium text-pine-800 hover:text-pine-600">{t.track}</Link>
          <Link href="/appointment" prefetch={true} className="inline-flex items-center gap-2 whitespace-nowrap rounded-[8px] bg-pine-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-pine-700">
            {t.book}<ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-[8px] border border-pine-100 bg-pine-50 p-0.5">
          {[
            ["en", "EN"],
            ["bn", "বাংলা"],
          ].map(([code, label]) => (
            <form key={code} action={setLang}>
              <input type="hidden" name="lang" value={code} />
              <button type="submit" aria-label={`Change language to ${label}`} aria-pressed={lang === code}
                className={`rounded-[6px] px-2 py-1.5 text-[10px] font-medium transition ${lang === code ? "bg-pine-900 text-white" : "text-pine-800 hover:bg-pine-100"}`}>
                {label}
              </button>
            </form>
          ))}
        </div>
        <MobileNavMenu primaryLinks={primaryLinks} groups={groups} trackLabel={t.track} bookLabel={t.book} bn={bn} />
      </nav>
    </header>
  );
}
