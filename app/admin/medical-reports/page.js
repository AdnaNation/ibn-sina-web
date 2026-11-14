import AdminActionForm from "@/components/AdminActionForm";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getSession, hasPermission } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";
import { listMedicalReports } from "@/lib/medical-reports";
import { uploadMedicalReport, revokeMedicalReport } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Private medical reports", robots: { index: false, follow: false } };

const input = "mt-1 w-full rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm";

export default async function MedicalReportsPage({ searchParams }) {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (!hasPermission(p, "reports.view") && !hasPermission(p, "reports.upload")) redirect("/admin");
  const { bn, tr } = await getAdmin();
  const sp = await searchParams;
  const canUpload = hasPermission(p, "reports.upload");
  const reports = await listMedicalReports(p);
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  const label = (en, b) => bn ? b : en;
  return <>
    <AdminNav p={p} current="/admin/medical-reports" />
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">{label("Private patient records", "রোগীর ব্যক্তিগত নথি")}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-pine-950">{label("Medical reports", "মেডিকেল রিপোর্ট")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{label("Upload a diagnostic report and link it to an existing appointment. Files are stored privately in MongoDB and are never exposed through public file URLs.", "ডায়াগনস্টিক রিপোর্ট আপলোড করে বিদ্যমান অ্যাপয়েন্টমেন্টের সঙ্গে যুক্ত করুন। ফাইল MongoDB-তে ব্যক্তিগতভাবে সংরক্ষিত থাকে এবং কোনো পাবলিক ফাইল লিংক তৈরি হয় না।")}</p>

      {sp.err && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{sp.err}</p>}
      {sp.created && <section role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>{label("Report uploaded.", "রিপোর্ট আপলোড হয়েছে।")}</strong><p className="mt-1">{label("Give the patient this report ID and the passcode you entered. The passcode is stored as a hash and cannot be recovered later.", "রোগীকে এই রিপোর্ট আইডি এবং আপনার দেওয়া পাসকোডটি ব্যক্তিগতভাবে দিন। পাসকোডটি হ্যাশ আকারে সংরক্ষিত হয়, পরে আর দেখা যাবে না।")}</p><p className="mt-2 font-mono font-bold">{sp.created}</p><a className="mt-2 inline-block font-bold underline" href="/medical-reports">{label("Open patient access page", "রোগীর রিপোর্ট পেজ খুলুন")}</a></section>}
      {sp.revoked && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{label("Report access revoked and stored file deleted.", "রিপোর্টের প্রবেশাধিকার বাতিল এবং ফাইল মুছে ফেলা হয়েছে।")}</p>}

      {canUpload && <AdminActionForm action={uploadMedicalReport} className="mt-6 grid gap-4 rounded-2xl border border-pine-100 bg-white p-5 md:grid-cols-2" encType="multipart/form-data" successMessage="Report uploaded. Share the report ID securely with the patient." pendingMessage="Uploading report…">
        <div className="md:col-span-2"><h2 className="font-serif text-2xl text-pine-950">{label("Upload a patient report", "রোগীর রিপোর্ট আপলোড করুন")}</h2><p className="mt-1 text-xs leading-5 text-ink/60">{label("Find the patient's appointment using its tracking reference. Only appointments in your authorized branch/doctor scope can be selected.", "অ্যাপয়েন্টমেন্টের ট্র্যাকিং রেফারেন্স দিয়ে রোগী নির্বাচন করুন। শুধু আপনার অনুমোদিত শাখা/চিকিৎসকের অ্যাপয়েন্টমেন্ট ব্যবহার করা যাবে।")}</p></div>
        <label className="text-sm font-semibold text-pine-800">{label("Appointment tracking reference", "অ্যাপয়েন্টমেন্ট ট্র্যাকিং রেফারেন্স")}<input name="appointmentRef" required maxLength={32} placeholder="IST-XXXXXXXXXXXX" className={input}/></label>
        <label className="text-sm font-semibold text-pine-800">{label("Report title", "রিপোর্টের নাম")}<input name="title" required maxLength={100} placeholder={label("e.g. Complete Blood Count", "যেমন: Complete Blood Count")} className={input}/></label>
        <label className="text-sm font-semibold text-pine-800">{label("Report type", "রিপোর্টের ধরন")}<select name="type" required defaultValue="Laboratory" className={input}>{[["Laboratory","Laboratory","ল্যাবরেটরি"],["Imaging","Imaging","ইমেজিং"],["Pathology","Pathology","প্যাথলজি"],["Prescription","Prescription","প্রেসক্রিপশন"],["Other","Other","অন্যান্য"]].map(([v,en,b])=><option key={v} value={v}>{label(en,b)}</option>)}</select></label>
        <label className="text-sm font-semibold text-pine-800">{label("Report date", "রিপোর্টের তারিখ")}<input name="reportDate" type="date" required defaultValue={date} className={input}/></label>
        <label className="text-sm font-semibold text-pine-800">{label("Patient access passcode (10–64 characters)", "রোগীর অ্যাক্সেস পাসকোড (১০–৬৪ অক্ষর)")}<input name="passcode" type="password" required minLength={10} maxLength={64} autoComplete="new-password" className={input}/><span className="mt-1 block text-xs font-normal text-ink/55">{label("Create a unique, hard-to-guess passcode and give it to the patient privately. Do not reuse passwords.", "অনুমান করা কঠিন আলাদা পাসকোড তৈরি করে রোগীকে ব্যক্তিগতভাবে দিন। অন্য পাসওয়ার্ড পুনরায় ব্যবহার করবেন না।")}</span></label>
        <label className="text-sm font-semibold text-pine-800">{label("PDF or image (max 8 MB)", "PDF অথবা ছবি (সর্বোচ্চ ৮ MB)")}<input name="file" type="file" required accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" className={input}/><span className="mt-1 block text-xs font-normal text-ink/55">PDF, PNG, JPG, WEBP</span></label>
        <div className="md:col-span-2"><button className="rounded-full bg-pine-900 px-6 py-3 text-sm font-bold text-white hover:bg-pine-800">{label("Upload private report", "ব্যক্তিগত রিপোর্ট আপলোড")}</button></div>
      </AdminActionForm>}

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><h2 className="font-serif text-2xl text-pine-950">{label("Recently uploaded reports", "সাম্প্রতিক আপলোড করা রিপোর্ট")}</h2><span className="text-xs text-ink/55">{label("Latest 100 in your scope", "আপনার আওতায় সর্বশেষ ১০০টি")}</span></div>
        {reports === null ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{label("Database unavailable.", "ডাটাবেস সংযুক্ত নয়।")}</p> : !reports.length ? <p className="rounded-xl border border-pine-100 bg-white p-6 text-sm text-ink/60">{label("No medical reports have been uploaded yet.", "এখনো কোনো মেডিকেল রিপোর্ট আপলোড করা হয়নি।")}</p> : <div className="overflow-x-auto rounded-2xl border border-pine-100 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-pine-50 text-xs text-ink/60"><tr>{[label("Report ID","রিপোর্ট আইডি"),label("Patient / appointment","রোগী / অ্যাপয়েন্টমেন্ট"),label("Report","রিপোর্ট"),label("Branch","শাখা"),label("Uploaded","আপলোড")," "].map((x,i)=><th key={i} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{reports.map((r)=><tr key={r.reportId} className="border-t border-pine-50"><td className="px-4 py-3 font-mono text-xs font-bold">{r.reportId}</td><td className="px-4 py-3"><b>{r.patientName}</b><span className="block text-xs text-ink/50">{r.appointmentRef}</span></td><td className="px-4 py-3"><b>{r.title}</b><span className="block text-xs text-ink/50">{r.type} · {r.reportDate}</span></td><td className="px-4 py-3 text-xs">{r.unit}</td><td className="px-4 py-3 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString(bn ? "bn-BD" : "en-GB") : "—"}</td><td className="px-4 py-3 text-right">{canUpload && <AdminActionForm action={revokeMedicalReport} successMessage="Report access revoked and file deleted." pendingMessage="Revoking report…"><input type="hidden" name="reportId" value={r.reportId}/><button className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">{label("Revoke", "বাতিল")}</button></AdminActionForm>}</td></tr>)}</tbody></table></div>}
      </section>
      <p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">{label("Prototype only: use fictional files and data. A passcode is a demonstration access control, not verified patient identity or an OTP. Do not upload real medical records. Real use requires approved identity verification, consent, encryption, retention controls, monitoring and a formal security review.", "শুধু প্রোটোটাইপ: কাল্পনিক ফাইল ও তথ্য ব্যবহার করুন। পাসকোডটি শুধু প্রদর্শনীর প্রবেশ-নিয়ন্ত্রণ; এটি রোগীর পরিচয় যাচাই বা OTP নয়। বাস্তব মেডিকেল রিপোর্ট আপলোড করবেন না। বাস্তব ব্যবহারের আগে অনুমোদিত পরিচয় যাচাই, সম্মতি, এনক্রিপশন, সংরক্ষণ নীতি, মনিটরিং ও নিরাপত্তা পর্যালোচনা প্রয়োজন।")}</p>
    </main>
  </>;
}
