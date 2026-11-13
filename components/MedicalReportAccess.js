"use client";

import { useState } from "react";
import { FileLock2, Download, ShieldCheck } from "lucide-react";

export default function MedicalReportAccess({ lang = "en" }) {
  const bn = lang === "bn";
  const t = (en, bangla) => bn ? bangla : en;
  const [reportId, setReportId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFile(null);
    try {
      const response = await fetch("/api/medical-reports/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: reportId.trim().toUpperCase(), passcode }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t("The report could not be accessed. Check the details and try again.", "রিপোর্ট খোলা যায়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।"));
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const name = match?.[1] || "medical-report";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFile(name);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setPasscode("");
    } catch (err) {
      setError(err.message || t("Unable to access this report.", "রিপোর্টটি খোলা যাচ্ছে না।"));
    } finally {
      setBusy(false);
    }
  }

  return <section className="mx-auto max-w-xl px-4 py-14">
    <div className="rounded-3xl border border-pine-100 bg-white p-6 shadow-sm sm:p-9">
      <span className="grid size-12 place-items-center rounded-2xl bg-pine-50 text-pine-800"><FileLock2 size={23}/></span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">{t("Private patient portal · Demo", "রোগীর ব্যক্তিগত পোর্টাল · ডেমো")}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-pine-950">{t("Access your medical report", "আপনার মেডিকেল রিপোর্ট দেখুন")}</h1>
      <p className="mt-3 text-sm leading-6 text-ink/65">{t("Enter the report ID and the private passcode provided by the staff member who uploaded your report. Both are required.", "যে কর্মী আপনার রিপোর্ট আপলোড করেছেন, তাঁর দেওয়া রিপোর্ট আইডি ও ব্যক্তিগত পাসকোড লিখুন। দুটিই প্রয়োজন।")}</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block text-sm font-semibold text-pine-800">{t("Report ID", "রিপোর্ট আইডি")}<input value={reportId} onChange={(e)=>setReportId(e.target.value.toUpperCase())} required maxLength={19} placeholder="MR-0123456789ABCDEF" autoCapitalize="characters" className="mt-1 w-full rounded-xl border border-pine-100 bg-white px-3 py-3 font-mono text-sm outline-none focus:border-pine-500 focus:ring-2 focus:ring-pine-100"/></label>
        <label className="block text-sm font-semibold text-pine-800">{t("Private passcode", "ব্যক্তিগত পাসকোড")}<input value={passcode} onChange={(e)=>setPasscode(e.target.value)} required minLength={10} maxLength={64} type="password" autoComplete="off" className="mt-1 w-full rounded-xl border border-pine-100 bg-white px-3 py-3 text-sm outline-none focus:border-pine-500 focus:ring-2 focus:ring-pine-100"/></label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {file && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><Download size={15} className="mr-1 inline"/> {t("Download started:", "ডাউনলোড শুরু হয়েছে:")} {file}</p>}
        <button disabled={busy} className="w-full rounded-full bg-pine-900 px-5 py-3.5 text-sm font-bold text-white hover:bg-pine-800 disabled:opacity-60">{busy ? t("Verifying…", "যাচাই হচ্ছে…") : t("Verify & download report", "যাচাই করে রিপোর্ট ডাউনলোড করুন")}</button>
      </form>
      <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-ink/55"><ShieldCheck size={15} className="mt-0.5 shrink-0"/>{t("The passcode is sent securely in the request body, not placed in the page URL. Access attempts are rate-limited. Files are served only after the report ID and passcode match.", "পাসকোড পেজের URL-এ নয়, নিরাপদ request body-তে পাঠানো হয়। প্রবেশের চেষ্টা সীমিত রাখা হয়। রিপোর্ট আইডি ও পাসকোড মিললেই শুধু ফাইল দেওয়া হয়।")}</p>
    </div>
    <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">{t("Independent prototype only. Do not enter real patient information or upload real medical records. This passcode flow is not a substitute for verified patient identity, OTP delivery, or a hospital-approved patient portal.", "শুধু স্বতন্ত্র প্রোটোটাইপ। বাস্তব রোগীর তথ্য দেবেন না বা মেডিকেল রিপোর্ট আপলোড করবেন না। এই পাসকোড ব্যবস্থা রোগীর পরিচয় যাচাই, OTP বা হাসপাতাল অনুমোদিত পোর্টালের বিকল্প নয়।")}</p>
  </section>;
}
