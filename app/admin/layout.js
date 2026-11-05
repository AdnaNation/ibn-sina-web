import { getLang } from "@/lib/i18n";

// Staff area: never indexed and kept separate from the public website shell.
export const metadata = {
  title: { default: "Independent Prototype Staff Portal", template: "%s | Prototype Staff Portal" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const bn = (await getLang()) === "bn";
  return (
    <div className="min-h-screen bg-[#f3f7f5] text-ink">
      <aside
        role="note"
        aria-label={bn ? "প্রোটোটাইপ সংক্রান্ত ঘোষণা" : "Prototype notice"}
        className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs leading-5 text-amber-950"
      >
        <strong>{bn ? "স্বাধীন প্রোটোটাইপ:" : "Independent prototype:"}</strong>{" "}
        {bn
          ? "এটি কোনো হাসপাতালের আনুষ্ঠানিক কর্মী পোর্টাল নয়। বাস্তব রোগীর তথ্য বা প্রকৃত কর্মী পরিচয়পত্র ব্যবহার করবেন না।"
          : "This is not an official hospital staff portal. Do not use real patient data or actual staff credentials."}
      </aside>
      {children}
    </div>
  );
}
