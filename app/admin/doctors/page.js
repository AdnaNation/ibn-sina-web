import AdminActionForm from "@/components/AdminActionForm";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { getSession, hasPermission } from "@/lib/auth";
import { getAdmin } from "@/lib/adminT";
import { listDoctorsAdmin } from "@/lib/doctors";
import { getUnits, getDepartments } from "@/lib/data";
import { bnDigits } from "@/lib/bnData";
import { addDoctorAction, saveDoctorAction, deleteDoctorAction, importDoctorsAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Doctors" };

const input = "mt-1 w-full rounded-xl border border-pine-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-pine-500 focus:ring-2 focus:ring-pine-100";

export default async function DoctorsAdmin({ searchParams }) {
  const p = await getSession();
  if (!p) redirect("/admin/login");
  if (!hasPermission(p, "doctors.view")) redirect("/admin");
  const { bn } = await getAdmin();
  const t = (en, b) => (bn ? b : en);
  const sp = await searchParams;
  const canManage = hasPermission(p, "doctors.manage");
  const [{ connected, rows, seeded }, units, departments] = await Promise.all([listDoctorsAdmin(p), getUnits(), getDepartments()]);
  const unitNames = units.filter((u) => u.type !== "Education").map((u) => `${u.name}, ${u.area}`).filter((u) => p.role === "owner" || u === p.unit);
  const msg = { created: t("Doctor added.", "ডাক্তার যোগ করা হয়েছে।"), saved: t("Changes saved.", "পরিবর্তন সংরক্ষিত হয়েছে।"), deleted: t("Doctor deleted.", "ডাক্তার মুছে ফেলা হয়েছে।"), imported: t("Starter doctors imported. You can now edit them.", "প্রাথমিক ডাক্তার তালিকা আনা হয়েছে। এখন সম্পাদনা করতে পারবেন।") }[sp.ok];

  const Fields = ({ d }) => (
    <>
      <label className="text-xs font-bold text-pine-800">{t("Full name (English)", "পূর্ণ নাম (ইংরেজি)")}<input name="name" required defaultValue={d?.name} placeholder="Dr. Rahim Uddin" className={input} /></label>
      <label className="text-xs font-bold text-pine-800">{t("Name in Bengali (optional)", "বাংলায় নাম (ঐচ্ছিক)")}<input name="nameBn" defaultValue={d?.nameBn} placeholder="ডা. রহিম উদ্দিন" className={input} /></label>
      <label className="text-xs font-bold text-pine-800">{t("Department", "বিভাগ")}
        <select name="department" required defaultValue={d?.department || ""} className={input}>
          <option value="" disabled>{t("Select department", "বিভাগ বেছে নিন")}</option>
          {departments.map((x) => <option key={x.slug} value={x.name}>{x.name}</option>)}
          {d && !departments.some((x) => x.name === d.department) && <option value={d.department}>{d.department}</option>}
        </select>
      </label>
      <label className="text-xs font-bold text-pine-800">{t("Phone (optional)", "ফোন (ঐচ্ছিক)")}<input name="phone" defaultValue={d?.phone} placeholder="Verified doctor contact only" className={input} /></label>
      <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-pine-900"><input type="checkbox" name="featured" defaultChecked={d?.featured} className="size-4 accent-emerald-700" />{t("Show on homepage", "হোমপেজে দেখান")}</label>
    </>
  );

  return (
    <>
      <AdminNav p={p} current="/admin/doctors" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-serif text-3xl font-semibold text-pine-950">{t("Doctors", "ডাক্তার")}</h1>
        <p className="mt-1 text-sm text-ink/65">{t("Keep the public doctor directory correct. Patients see these names, departments and branches.", "পাবলিক ডাক্তার তালিকা সঠিক রাখুন। রোগীরা এই নাম, বিভাগ ও শাখা দেখতে পান।")}</p>
        {sp.err && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{sp.err}</p>}
        {msg && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</p>}
        {!connected && <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{t("The database is not connected.", "ডাটাবেস সংযুক্ত নেই।")}</p>}

        {connected && !seeded && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-bold text-amber-950">{t("The public site is showing the built-in starter list", "পাবলিক সাইটে এখন ডিফল্ট প্রাথমিক তালিকা দেখানো হচ্ছে")}</h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">{t("The starter list is only a sample. Import it once, then correct every name, department and branch here before launch.", "প্রাথমিক তালিকাটি শুধু নমুনা। একবার আমদানি করুন, তারপর চালুর আগে এখান থেকে প্রতিটি নাম, বিভাগ ও শাখা ঠিক করুন।")}</p>
            {p.role === "owner" ? <AdminActionForm action={importDoctorsAction} className="mt-3" successMessage={t("Starter doctors imported.", "প্রাথমিক ডাক্তার তালিকা আমদানি হয়েছে।")} pendingMessage={t("Importing doctors…", "ডাক্তার তালিকা আমদানি হচ্ছে…")}><button className="rounded-full bg-amber-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-800">{t("Import starter doctors", "প্রাথমিক ডাক্তার আমদানি করুন")}</button></AdminActionForm> : <p className="mt-2 text-xs text-amber-900">{t("Ask the Main Admin to import it.", "মূল অ্যাডমিনকে এটি আমদানি করতে বলুন।")}</p>}
          </section>
        )}

        {connected && seeded && canManage && (
          <section className="mt-6 rounded-2xl border border-pine-100 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-pine-950">{t("Add a doctor", "নতুন ডাক্তার যোগ করুন")}</h2>
            <AdminActionForm action={addDoctorAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" successMessage={t("Doctor added.", "ডাক্তার যোগ করা হয়েছে।")} pendingMessage={t("Adding doctor…", "ডাক্তার যোগ হচ্ছে…")} resetOnSuccess>
              <Fields />
              <label className="text-xs font-bold text-pine-800 sm:col-span-2 lg:col-span-1">{t("Branch", "শাখা")}
                <select name="unit" required defaultValue={p.role === "owner" ? "" : p.unit} className={input}>
                  <option value="" disabled>{t("Select branch", "শাখা বেছে নিন")}</option>
                  {unitNames.map((u) => <option key={u} value={u}>{u.replace("Ibn Sina ", "")}</option>)}
                </select>
              </label>
              <button className="self-end rounded-xl bg-pine-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-pine-800">{t("Add doctor", "ডাক্তার যোগ করুন")}</button>
            </AdminActionForm>
          </section>
        )}

        {connected && seeded && (
          <section className="mt-6">
            <h2 className="font-serif text-2xl font-semibold text-pine-950">{t("Directory", "তালিকা")} <span className="text-base font-normal text-ink/50">({bn ? bnDigits(rows.length) : rows.length})</span></h2>
            <ul className="mt-3 space-y-3">
              {rows.map((d) => (
                <li key={d.slug} className="rounded-2xl border border-pine-100 bg-white p-4 shadow-sm">
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                      <span><b className="text-pine-950">{d.name}</b>{d.featured && <span className="ml-2 rounded-full bg-brass-light px-2 py-0.5 text-[10px] font-bold text-pine-900">{t("Homepage", "হোমপেজ")}</span>}<span className="block text-xs text-ink/60">{d.department} · {d.unit.replace("Ibn Sina ", "")}</span></span>
                      {canManage && <span className="text-xs font-bold text-pine-700 underline underline-offset-4">{t("Edit", "সম্পাদনা")}</span>}
                    </summary>
                    {canManage && (
                      <div className="mt-4 border-t border-pine-50 pt-4">
                        <AdminActionForm action={saveDoctorAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" successMessage={t("Doctor changes saved.", "ডাক্তারের তথ্য সংরক্ষিত হয়েছে।")} pendingMessage={t("Saving doctor…", "ডাক্তারের তথ্য সংরক্ষণ হচ্ছে…")}>
                          <input type="hidden" name="slug" value={d.slug} />
                          <Fields d={d} />
                          <button className="self-end rounded-xl bg-pine-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-pine-800">{t("Save", "সংরক্ষণ")}</button>
                        </AdminActionForm>
                        <AdminActionForm action={deleteDoctorAction} className="mt-3" successMessage={t("Doctor deleted.", "ডাক্তার মুছে ফেলা হয়েছে।")} pendingMessage={t("Deleting doctor…", "ডাক্তার মুছে ফেলা হচ্ছে…")}>
                          <input type="hidden" name="slug" value={d.slug} />
                          <button className="text-xs font-bold text-rose-700 underline underline-offset-4">{t("Delete doctor", "ডাক্তার মুছুন")}</button>
                          <span className="ml-2 text-xs text-ink/50">{t("Only possible if the doctor has no schedules or patients.", "শুধু তখনই সম্ভব যখন ডাক্তারের কোনো সময়সূচি বা রোগী নেই।")}</span>
                        </AdminActionForm>
                      </div>
                    )}
                  </details>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
