import { getLang } from "@/lib/i18n";

export default async function PrototypeNotice() {
  const lang = await getLang();
  const bn = lang === "bn";

  return (
    <aside
      role="note"
      aria-label={bn ? "প্রোটোটাইপ সংক্রান্ত ঘোষণা" : "Prototype notice"}
      className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] leading-4 text-amber-950 sm:px-4 sm:py-3 sm:text-sm sm:leading-5"
    >
      <span className="sm:hidden">
        <strong>{bn ? "ডেমো প্রোটোটাইপ:" : "Demo prototype:"}</strong>{" "}
        {bn
          ? "ইবনে সিনা ট্রাস্টের আনুষ্ঠানিক সেবা নয়। বাস্তব রোগীর তথ্য দেবেন না।"
          : "Not an official Ibn Sina Trust service. Do not enter real patient data."}
      </span>
      <span className="hidden sm:inline">
        <strong>{bn ? "স্বাধীন প্রদর্শনীমূলক প্রোটোটাইপ:" : "Independent demonstration prototype:"}</strong>{" "}
        {bn
          ? "এটি ইবনে সিনা ট্রাস্টের আনুষ্ঠানিক ওয়েবসাইট বা অনুমোদিত বুকিং সেবা নয়। প্রদর্শিত তথ্য ও চিকিৎসক/শাখার বিবরণ যাচাই করা হয়নি। অনুগ্রহ করে এখানে বাস্তব রোগীর ব্যক্তিগত বা চিকিৎসা-সংক্রান্ত তথ্য দেবেন না।"
          : "This is not the official Ibn Sina Trust website or an authorized booking service. Displayed information and doctor/branch details have not been verified. Please do not enter real patients’ personal or medical information here."}
      </span>
    </aside>
  );
}
