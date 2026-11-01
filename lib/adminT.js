import { getLang } from "./i18n";

// Admin screens are written in English; `tr("English text")` returns the Bengali
// version when the staff member has chosen Bengali. Unknown strings fall back to
// English, so a missing translation never breaks a page.
const BN = {
  // ---- shell / common
  "Overview": "সারসংক্ষেপ", "Queue": "সিরিয়াল", "Schedules": "সময়সূচি", "Branches": "শাখা",
  "Audit log": "অডিট লগ", "Users & permissions": "ব্যবহারকারী ও অনুমতি", "Appointments": "অ্যাপয়েন্টমেন্ট",
  "Doctors": "ডাক্তার", "Sign out": "সাইন আউট", "Staff": "কর্মী", "Main Admin": "মূল অ্যাডমিন",
  "Branch Admin": "শাখা অ্যাডমিন", "All branches": "সব শাখা", "Save": "সংরক্ষণ", "Cancel": "বাতিল",
  "Search": "খুঁজুন", "Clear": "মুছুন", "Active": "সক্রিয়", "Inactive": "নিষ্ক্রিয়", "Date": "তারিখ",
  "Show": "দেখুন", "Add": "যোগ করুন", "Find": "খুঁজুন", "Status": "অবস্থা", "Name": "নাম",
  "Phone": "ফোন", "Serial": "সিরিয়াল", "Actions": "কাজ", "Back": "ফিরে যান", "Edit": "সম্পাদনা",
  "Remove": "সরান", "Open": "খুলুন", "Total": "মোট", "None": "কিছু নেই",
  // ---- queue
  "Waiting": "অপেক্ষমাণ", "With doctor": "ডাক্তারের কাছে", "Did not come": "আসেননি", "Cancelled": "বাতিল",
  "Today’s queue": "আজকের সিরিয়াল",
  "This page updates by itself every few seconds.": "এই পেজ কয়েক সেকেন্ড পরপর নিজে থেকেই হালনাগাদ হয়।",
  "No queue is open for this date yet. Start one below, or it opens by itself when the first patient books.": "এই তারিখে এখনো কোনো সিরিয়াল চালু হয়নি। নিচ থেকে শুরু করুন, অথবা প্রথম রোগী বুক করলে নিজে থেকেই চালু হবে।",
  "With the doctor now": "এখন ডাক্তারের কাছে", "This queue has ended for the day.": "আজকের জন্য এই সিরিয়াল শেষ হয়েছে।",
  "Finish this patient and call next": "এই রোগীর দেখা শেষ করে পরবর্তী রোগীকে ডাকুন",
  "Finish this patient": "এই রোগীর দেখা শেষ", "Call next patient": "পরবর্তী রোগীকে ডাকুন",
  "Use this if the patient did not come when called": "ডাকার পর রোগী না এলে এটি ব্যবহার করুন",
  "Patient did not come": "রোগী আসেননি", "Doctor is on a break": "ডাক্তার বিরতিতে আছেন", "Doctor is back": "ডাক্তার ফিরেছেন",
  "Doctor has arrived": "ডাক্তার পৌঁছেছেন", "Is the doctor late?": "ডাক্তার কি দেরি করছেন?",
  "Tap one. Every waiting patient sees it and their time estimate updates.": "একটি বেছে নিন। অপেক্ষমাণ সব রোগী তা দেখতে পাবেন এবং তাদের সম্ভাব্য সময় হালনাগাদ হবে।",
  "Optional message, e.g. Doctor is in surgery": "ঐচ্ছিক বার্তা, যেমন: ডাক্তার অপারেশনে আছেন",
  "Message for patients": "রোগীদের জন্য বার্তা", "On time": "সময়মতো",
  "Patient came without booking?": "বুকিং ছাড়া রোগী এসেছেন?", "Add them here and they get the next serial.": "এখানে যোগ করুন, তিনি পরবর্তী সিরিয়াল পাবেন।",
  "Patient name": "রোগীর নাম", "Mobile (optional)": "মোবাইল (ঐচ্ছিক)", "Mobile": "মোবাইল",
  "Find by name, phone or code": "নাম, ফোন বা কোড দিয়ে খুঁজুন", "Find a patient": "রোগী খুঁজুন",
  "walk-in": "সরাসরি এসেছেন", "Call again": "আবার ডাকুন", "No patient matches your search.": "আপনার খোঁজের সঙ্গে কোনো রোগী মেলেনি।",
  "No patients yet.": "এখনো কোনো রোগী নেই।", "More options": "আরও অপশন", "Starts at": "শুরু", "Seats": "আসন",
  "End today’s queue": "আজকের সিরিয়াল শেষ করুন", "Start a queue for another doctor": "অন্য ডাক্তারের জন্য সিরিয়াল শুরু করুন",
  "Doctor": "ডাক্তার", "Start queue": "সিরিয়াল শুরু", "How this works": "এটি কীভাবে কাজ করে",
  "Patients book online and get a serial number.": "রোগীরা অনলাইনে বুক করে সিরিয়াল নম্বর পান।",
  "When the doctor is ready, press": "ডাক্তার প্রস্তুত হলে চাপুন",
  "If the doctor is late, tap how late. Patients are told, so they don’t wait at the hospital.": "ডাক্তার দেরি করলে কতক্ষণ দেরি তা চাপুন। রোগীদের জানানো হয়, তাই তাদের হাসপাতালে বসে থাকতে হয় না।",
  // ---- staff
  "Main administration": "মূল প্রশাসন", "Branch administration": "শাখা প্রশাসন",
  "Create branch administrators and branch staff. Each account is restricted to its assigned branch.": "শাখা অ্যাডমিন ও শাখার কর্মী তৈরি করুন। প্রতিটি অ্যাকাউন্ট শুধু নির্ধারিত শাখায় সীমাবদ্ধ।",
  "Account": "অ্যাকাউন্ট", "created. Share the login credentials securely.": "তৈরি হয়েছে। লগইন তথ্য নিরাপদে পৌঁছে দিন।",
  "Create account": "অ্যাকাউন্ট তৈরি করুন", "Passwords are stored as salted hashes, never as plain text.": "পাসওয়ার্ড সল্টসহ হ্যাশ করে রাখা হয়, কখনো সরাসরি লেখা হিসেবে নয়।",
  "Full name": "পূর্ণ নাম", "Username": "ইউজারনেম", "Temporary password": "অস্থায়ী পাসওয়ার্ড", "Account type": "অ্যাকাউন্টের ধরন",
  "Branch administrator": "শাখা অ্যাডমিন", "Branch staff": "শাখার কর্মী", "Doctor / doctor assistant": "ডাক্তার / সহকারী",
  "Assigned branch": "নির্ধারিত শাখা", "Select branch": "শাখা বেছে নিন",
  "Doctor assignment (doctor role only)": "ডাক্তার নির্ধারণ (শুধু ডাক্তারের ভূমিকায়)",
  "Select doctor if applicable": "প্রযোজ্য হলে ডাক্তার বেছে নিন", "Staff permissions": "কর্মীর অনুমতি",
  "Branch administrators automatically receive full permissions inside their own branch. Select permissions for regular staff.": "শাখা অ্যাডমিন নিজের শাখায় স্বয়ংক্রিয়ভাবে সব অনুমতি পান। সাধারণ কর্মীর জন্য অনুমতি বেছে নিন।",
  "All branch accounts": "সব শাখার অ্যাকাউন্ট", "Your branch team": "আপনার শাখার টিম",
  "All branch permissions": "শাখার সব অনুমতি", "No extra permissions": "অতিরিক্ত কোনো অনুমতি নেই",
  "Reactivate": "আবার চালু করুন", "Deactivate": "নিষ্ক্রিয় করুন", "No accounts created yet.": "এখনো কোনো অ্যাকাউন্ট তৈরি হয়নি।",
  // permission labels + groups
  "View appointments": "অ্যাপয়েন্টমেন্ট দেখা", "Create and update appointments": "অ্যাপয়েন্টমেন্ট তৈরি ও পরিবর্তন",
  "View patient details": "রোগীর তথ্য দেখা", "Operate the live patient queue": "লাইভ রোগী সিরিয়াল পরিচালনা",
  "Publish and manage doctor schedules": "ডাক্তারের সময়সূচি প্রকাশ ও পরিচালনা", "View branch doctors": "শাখার ডাক্তার দেখা",
  "Add and edit branch doctors": "শাখার ডাক্তার যোগ ও সম্পাদনা", "View branch reports": "শাখার রিপোর্ট দেখা",
  "View payments and billing": "পেমেন্ট ও বিল দেখা", "Manage payments and billing": "পেমেন্ট ও বিল পরিচালনা",
  "Patients & appointments": "রোগী ও অ্যাপয়েন্টমেন্ট", "Clinic operations": "চেম্বার পরিচালনা", "Reports & finance": "রিপোর্ট ও আর্থিক",
  // ---- branches
  "Organization control": "প্রতিষ্ঠান নিয়ন্ত্রণ", "Branch management": "শাখা ব্যবস্থাপনা",
  "Create and maintain hospital branches, assign branch administrators, and monitor branch-level activity from one place.": "এক জায়গা থেকে হাসপাতালের শাখা তৈরি ও পরিচালনা করুন, শাখা অ্যাডমিন নির্ধারণ করুন এবং শাখাভিত্তিক কার্যক্রম দেখুন।",
  "Total branches": "মোট শাখা", "Active branches": "সক্রিয় শাখা", "Branch administrators": "শাখা অ্যাডমিন", "Other accounts": "অন্যান্য অ্যাকাউন্ট",
  "Create a branch": "নতুন শাখা তৈরি করুন", "New branches are immediately available for administrator assignment.": "নতুন শাখা সঙ্গে সঙ্গে অ্যাডমিন নিয়োগের জন্য পাওয়া যায়।",
  "Branch / facility name": "শাখা / প্রতিষ্ঠানের নাম", "Area": "এলাকা", "City": "শহর", "Facility type": "প্রতিষ্ঠানের ধরন",
  "Hospital": "হাসপাতাল", "Diagnostic": "ডায়াগনস্টিক", "Medical College": "মেডিকেল কলেজ", "Specialized Centre": "বিশেষায়িত কেন্দ্র",
  "Hotline": "হটলাইন", "Address (optional)": "ঠিকানা (ঐচ্ছিক)", "Create branch": "শাখা তৈরি করুন",
  "Database unavailable": "ডাটাবেস পাওয়া যাচ্ছে না", "Activate": "চালু করুন",
  "Branch administrator accounts": "শাখা অ্যাডমিন অ্যাকাউন্ট",
  "Create accounts under Users & permissions. You can activate or suspend access here.": "“ব্যবহারকারী ও অনুমতি” থেকে অ্যাকাউন্ট তৈরি করুন। এখানে প্রবেশাধিকার চালু বা বন্ধ করতে পারবেন।",
  "Create administrator ↗": "অ্যাডমিন তৈরি করুন ↗", "Reactivate account": "অ্যাকাউন্ট আবার চালু করুন", "Deactivate account": "অ্যাকাউন্ট নিষ্ক্রিয় করুন",
  "No branch administrators created yet.": "এখনো কোনো শাখা অ্যাডমিন তৈরি হয়নি।",
  "Deactivating a branch prevents its staff accounts from signing in and hides it from public branch listings. Existing patient and appointment records are retained. Reactivating the branch restores branch sign-in access for accounts that are themselves active.": "শাখা নিষ্ক্রিয় করলে সেই শাখার কর্মীরা সাইন ইন করতে পারবেন না এবং পাবলিক শাখা তালিকা থেকে শাখাটি লুকিয়ে যাবে। রোগী ও অ্যাপয়েন্টমেন্টের রেকর্ড অক্ষত থাকবে। শাখা আবার চালু করলে সক্রিয় অ্যাকাউন্টগুলো আবার সাইন ইন করতে পারবে।",
  // ---- audit
  "Security & accountability": "নিরাপত্তা ও জবাবদিহি",
  "A chronological record of branch, account and permission-related administrative actions.": "শাখা, অ্যাকাউন্ট ও অনুমতি-সংক্রান্ত প্রশাসনিক কাজের সময়ানুক্রমিক রেকর্ড।",
  "Filter action (e.g. branch)": "কাজ ফিল্টার করুন (যেমন: branch)", "Filter": "ফিল্টার",
  "Database is not connected. Audit records are stored in MongoDB.": "ডাটাবেস সংযুক্ত নয়। অডিট রেকর্ড MongoDB-তে থাকে।",
  "Activity": "কাজ", "Actor": "যিনি করেছেন", "Target": "লক্ষ্য", "Time": "সময়",
  "No matching audit events.": "মেলে এমন কোনো ঘটনা নেই।",
  "Showing up to 200 newest events. Audit records are append-only through this interface.": "সর্বশেষ ২০০টি ঘটনা পর্যন্ত দেখানো হচ্ছে। এই ইন্টারফেস থেকে অডিট রেকর্ড শুধু যোগ হয়, মোছা যায় না।",
  // ---- schedules
  "Published": "প্রকাশিত", "On break": "বিরতিতে", "Finished": "শেষ", "Live": "চলমান",
  "Main admin workspace": "মূল অ্যাডমিন কর্মক্ষেত্র", "Branch admin workspace": "শাখা অ্যাডমিন কর্মক্ষেত্র",
  "All branch doctor schedules": "সব শাখার ডাক্তারের সময়সূচি", "Branch doctor schedules": "শাখার ডাক্তারের সময়সূচি",
  "Publish consultation sessions before patients book. Only published dates appear as available on the public appointment page.": "রোগী বুক করার আগে চেম্বারের সেশন প্রকাশ করুন। শুধু প্রকাশিত তারিখই পাবলিক অ্যাপয়েন্টমেন্ট পেজে খালি হিসেবে দেখা যায়।",
  "Open live queue": "লাইভ সিরিয়াল খুলুন",
  "Schedule published. Patients can now select this date when booking.": "সময়সূচি প্রকাশিত হয়েছে। রোগীরা এখন এই তারিখ বেছে নিতে পারবেন।",
  "Unused schedule removed.": "অব্যবহৃত সময়সূচি সরানো হয়েছে।", "Publish a session": "একটি সেশন প্রকাশ করুন",
  "Available for the next 14 days": "আগামী ১৪ দিনের জন্য",
  "No doctors are available in the directory. Add doctor records before publishing schedules.": "তালিকায় কোনো ডাক্তার নেই। সময়সূচি প্রকাশের আগে ডাক্তার যোগ করুন।",
  "Select a doctor": "ডাক্তার বেছে নিন", "Consultation date": "চেম্বারের তারিখ", "Start time": "শুরুর সময়",
  "Serial capacity": "সিরিয়াল সংখ্যা", "Avg. minutes / patient": "গড় মিনিট / রোগী",
  "Publishing a session makes the date bookable. Serial numbers are assigned atomically, and patients can track their estimated turn online.": "সেশন প্রকাশ করলে ওই তারিখে বুকিং করা যায়। একই সিরিয়াল দুজনকে দেওয়া হয় না, আর রোগীরা অনলাইনে সম্ভাব্য পালা দেখতে পারেন।",
  "Publish doctor schedule": "ডাক্তারের সময়সূচি প্রকাশ করুন", "Published calendar": "প্রকাশিত ক্যালেন্ডার",
  "Database is not connected. Configure MONGODB_URI to manage doctor schedules.": "ডাটাবেস সংযুক্ত নয়। সময়সূচি পরিচালনায় MONGODB_URI ঠিক করুন।",
  "No sessions published yet": "এখনো কোনো সেশন প্রকাশ হয়নি", "Create the first doctor schedule using the form.": "ফর্ম দিয়ে প্রথম সময়সূচি তৈরি করুন।",
  "Booked": "বুকড", "Serials left": "বাকি সিরিয়াল", "Last issued": "শেষ দেওয়া", "Open queue console ↗": "সিরিয়াল কনসোল খুলুন ↗",
  "Remove unused schedule": "অব্যবহৃত সময়সূচি সরান",
  "A schedule with patient activity cannot be removed from this page. Use the queue console to manage an active consultation. Verify each doctor’s real clinic hours and branch before publishing.": "যে সময়সূচিতে রোগীর কার্যক্রম আছে তা এই পেজ থেকে সরানো যাবে না। চলমান চেম্বার সিরিয়াল কনসোল থেকে পরিচালনা করুন। প্রকাশের আগে প্রতিটি ডাক্তারের প্রকৃত চেম্বারের সময় ও শাখা যাচাই করুন।",
  "accounts": "টি অ্যাকাউন্ট", "Admins": "অ্যাডমিন", "Seen": "দেখা হয়েছে",
  "Create staff accounts for your branch. You cannot create administrators or assign staff to another branch.": "আপনার শাখার জন্য কর্মীর অ্যাকাউন্ট তৈরি করুন। আপনি অ্যাডমিন তৈরি বা অন্য শাখায় কর্মী নিয়োগ করতে পারবেন না।",
};

export const BN_MAP = BN;

export async function getAdmin() {
  const lang = await getLang();
  const tr = (s) => (lang === "bn" ? BN[s] || s : s);
  return { lang, tr, bn: lang === "bn" };
}
