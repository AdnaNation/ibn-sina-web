import { cookies } from "next/headers";

export async function getLang() {
  return (await cookies()).get("lang")?.value === "bn" ? "bn" : "en";
}

// Bangla digits: 10615 becomes ১০৬১৫
export const num = (n, lang) =>
  lang === "bn"
    ? new Intl.NumberFormat("bn-BD", { useGrouping: false }).format(n)
    : String(n);

export async function getT() {
  const lang = await getLang();
  return { lang, t: dict[lang], n: (x) => num(x, lang) };
}

const dict = {
  en: {
    brand: "Ibn Sina Trust",
    tagline: "Serving humanity since 1980",
    hotline: "Hotline",
    fraud: "Job fraud notice: we never charge for jobs",
    nav: [
      "Find a doctor",
      "Services",
      "Our units",
      "Health packages",
      "About",
      "Live queue",
      "Track my turn",
    ],
    book: "Book an appointment",
    eyebrow: "Pioneer in healthcare, since June 1980",
    h1: "Good medicine should not depend on what you can afford.",
    heroSub: (c) =>
      `Hospitals, diagnostic centers and consultation units in ${c} cities, with 25% off on all diagnostic tests.`,
    doctorOrSpec: "Doctor or specialty",
    ph: "e.g. Cardiology, Dr. Hayee",
    dept: "Department",
    anyDept: "Any department",
    branch: "Branch",
    anyBranch: "Any branch",
    find: "Find a doctor",
    stats: [
      "year the trust was founded",
      "hospitals, diagnostic centers and institutes",
      "doctors you can book",
      "off all diagnostic tests",
    ],
    servicesTitle: "What we treat, scan and test",
    servicesSub:
      "Every unit follows the same quality policy. Choose a service to see which branches offer it.",
    packages: "Compare health check-up packages",
    doctorsTitle: "Doctors on call this week",
    allDoctors: "Browse all doctors",
    unitsTitle: "Find the unit nearest to you",
    dhaka: "Dhaka",
    across: "Across Bangladesh",
    allUnits: "See all units on the map",
    bannerTitle: "Need help choosing a doctor?",
    bannerSub:
      "Our team answers the hotline every day. Tell us your symptoms and we will point you to the right branch.",
    call: "Call",
    bookOnline: "Book online",
  },
  bn: {
    brand: "ইবনে সিনা ট্রাস্ট",
    tagline: "১৯৮০ সাল থেকে মানবতার সেবায়",
    hotline: "হটলাইন",
    fraud: "চাকরির প্রতারণা থেকে সাবধান: আমরা চাকরির জন্য কোনো টাকা নিই না",
    nav: [
      "ডাক্তার খুঁজুন",
      "সেবাসমূহ",
      "আমাদের শাখা",
      "হেলথ প্যাকেজ",
      "আমাদের সম্পর্কে",
      "লাইভ সিরিয়াল",
      "আমার সিরিয়াল দেখুন",
    ],
    book: "অ্যাপয়েন্টমেন্ট নিন",
    eyebrow: "জুন ১৯৮০ থেকে স্বাস্থ্যসেবার পথিকৃৎ",
    h1: "সামর্থ্য নয়, প্রয়োজনই হোক চিকিৎসার মাপকাঠি।",
    heroSub: (c) =>
      `${c}টি শহরে হাসপাতাল, ডায়াগনস্টিক সেন্টার ও কনসালটেশন ইউনিট। সব ডায়াগনস্টিক পরীক্ষায় ২৫% ছাড়।`,
    doctorOrSpec: "ডাক্তার বা বিশেষজ্ঞ বিভাগ",
    ph: "যেমন: কার্ডিওলজি, ডা. হায়ী",
    dept: "বিভাগ",
    anyDept: "যেকোনো বিভাগ",
    branch: "শাখা",
    anyBranch: "যেকোনো শাখা",
    find: "ডাক্তার খুঁজুন",
    stats: [
      "ট্রাস্ট প্রতিষ্ঠার বছর",
      "হাসপাতাল, ডায়াগনস্টিক সেন্টার ও প্রতিষ্ঠান",
      "ডাক্তার, যাঁদের সিরিয়াল নেওয়া যায়",
      "সব ডায়াগনস্টিক পরীক্ষায় ছাড়",
    ],
    servicesTitle: "চিকিৎসা, স্ক্যান ও পরীক্ষা",
    servicesSub:
      "সব শাখায় একই মানের নীতি মানা হয়। একটি সেবা বেছে নিন, কোন শাখায় পাওয়া যায় দেখুন।",
    packages: "হেলথ চেক-আপ প্যাকেজ তুলনা করুন",
    doctorsTitle: "এই সপ্তাহের ডাক্তারগণ",
    allDoctors: "সব ডাক্তার দেখুন",
    unitsTitle: "আপনার কাছের শাখা খুঁজুন",
    dhaka: "ঢাকা",
    across: "সারা বাংলাদেশে",
    allUnits: "সব শাখা ম্যাপে দেখুন",
    bannerTitle: "কোন ডাক্তার দেখাবেন বুঝতে পারছেন না?",
    bannerSub:
      "আমাদের হটলাইন প্রতিদিন খোলা। উপসর্গ জানালে আমরা সঠিক শাখা ও ডাক্তার বেছে দেব।",
    call: "কল করুন",
    bookOnline: "অনলাইনে বুক করুন",
  },
};
