// Bengali display helpers for directory data (departments, places, branch names).
// Pure functions, safe to import from server and client components.

const DEPT = {
  "Cardiology": "হৃদরোগ (কার্ডিওলজি)",
  "Medicine": "মেডিসিন",
  "Neurology": "স্নায়ুরোগ (নিউরোলজি)",
  "Gynaecology & Obstetrics": "গাইনি ও প্রসূতি",
  "Pediatrics": "শিশুরোগ",
  "Orthopedic Surgery": "অর্থোপেডিক সার্জারি",
  "General Surgery": "সাধারণ সার্জারি",
  "Gastroenterology": "গ্যাস্ট্রোএন্টারোলজি",
  "Gastroenterology (Liver)": "গ্যাস্ট্রো ও লিভার",
  "Endocrinology": "এন্ডোক্রাইনোলজি (হরমোন)",
  "Nephrology": "কিডনিরোগ (নেফ্রোলজি)",
  "Oncology": "ক্যান্সার (অনকোলজি)",
  "Ophthalmology": "চক্ষুরোগ",
  "ENT": "নাক-কান-গলা",
  "Dental": "দন্তরোগ",
  "Psychiatry": "মানসিক রোগ",
  "Chest Medicine": "বক্ষব্যাধি",
  "Radiology & Imaging": "রেডিওলজি ও ইমেজিং",
  "Physical Medicine": "ফিজিক্যাল মেডিসিন",
  "Nutrition": "পুষ্টি",
  "Vascular Surgery": "ভাস্কুলার সার্জারি",
};

const PLACE = {
  Dhaka: "ঢাকা", Dhanmondi: "ধানমন্ডি", Kallyanpur: "কল্যাণপুর", Doyagonj: "দয়াগঞ্জ", Zigatola: "জিগাতলা",
  Badda: "বাড্ডা", Uttara: "উত্তরা", Malibagh: "মালিবাগ", Mirpur: "মিরপুর", Jatrabari: "যাত্রাবাড়ী",
  Lalbagh: "লালবাগ", Keraniganj: "কেরানীগঞ্জ", Arshinagar: "আরশিনগর", Savar: "সাভার",
  Chattogram: "চট্টগ্রাম", Cumilla: "কুমিল্লা", Noakhali: "নোয়াখালী", Sylhet: "সিলেট",
  Rajshahi: "রাজশাহী", Bogura: "বগুড়া", Jashore: "যশোর",
};

const TYPE = { Hospital: "হাসপাতাল", Diagnostic: "ডায়াগনস্টিক", Education: "শিক্ষাপ্রতিষ্ঠান", "Medical College": "মেডিকেল কলেজ", "Specialized Centre": "বিশেষায়িত কেন্দ্র" };

const WORDS = [
  ["Ibn Sina", "ইবনে সিনা"], ["Specialized", "স্পেশালাইজড"], ["Medical College", "মেডিকেল কলেজ"],
  ["Nursing", "নার্সিং"], ["Institute", "ইনস্টিটিউট"], ["Diagnostic", "ডায়াগনস্টিক"], ["Consultation", "কনসালটেশন"],
  ["Imaging", "ইমেজিং"], ["Cancer", "ক্যান্সার"], ["Medical", "মেডিকেল"], ["Check-up", "চেক-আপ"],
  ["Hospital", "হাসপাতাল"], ["Center", "সেন্টার"], ["Centre", "সেন্টার"], ["Unit", "ইউনিট"],
  ["D.Lab", "ডি.ল্যাব"], ["&", "ও"],
];

export const isBn = (lang) => lang === "bn";
export const deptName = (name, lang) => (isBn(lang) ? DEPT[name] || name : name);
export const placeName = (name, lang) => (isBn(lang) ? PLACE[name] || name : name);
export const typeName = (name, lang) => (isBn(lang) ? TYPE[name] || name : name);

// "Ibn Sina Diagnostic & Consultation Center, Savar" -> Bengali
export function unitName(unit = "", lang) {
  if (!isBn(lang)) return unit;
  const i = unit.lastIndexOf(",");
  const name = i > -1 ? unit.slice(0, i) : unit;
  const area = i > -1 ? unit.slice(i + 1).trim() : "";
  let out = name;
  for (const [en, bn] of WORDS) out = out.split(en).join(bn);
  return area ? `${out}, ${placeName(area, lang)}` : out;
}

// Same, but without the leading "Ibn Sina " (used in compact cards)
export const shortUnit = (unit = "", lang) => unitName(unit.replace(/^Ibn Sina /, ""), lang);

// Doctors may carry an optional Bengali name: { name, nameBn }
export const doctorName = (d, lang) => (isBn(lang) && d.nameBn ? d.nameBn : d.name);

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const bnDigits = (s) => String(s).replace(/\d/g, (d) => BN_DIGITS[d]);
export const digits = (s, lang) => (isBn(lang) ? bnDigits(s) : String(s));
