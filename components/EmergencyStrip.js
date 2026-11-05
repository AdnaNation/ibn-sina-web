import { Siren } from "lucide-react";
import { getT } from "@/lib/i18n";

export default async function EmergencyStrip() {
  const { lang } = await getT();
  const bn = lang === "bn";
  return (
    <div className="border-b border-rose-200 bg-rose-50">
      <p className="mx-auto flex max-w-7xl items-start gap-2.5 px-4 py-2.5 text-[13px] leading-6 text-rose-900 sm:items-center">
        <Siren size={16} className="mt-1 shrink-0 text-alert sm:mt-0" />
        <span>
          <b>{bn ? "জরুরি চিকিৎসা প্রয়োজন?" : "Medical emergency?"}</b>{" "}
          {bn
            ? "অনলাইন সিরিয়ালের জন্য অপেক্ষা করবেন না। বাংলাদেশে ৯৯৯ নম্বরে কল করুন অথবা নিকটস্থ জরুরি বিভাগে যান।"
            : "Do not wait for an online queue. In Bangladesh, call 999 or go to the nearest emergency department."}
        </span>
      </p>
    </div>
  );
}
