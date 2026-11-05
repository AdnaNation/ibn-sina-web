import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { HeartPulse, LockKeyhole, ShieldCheck } from "lucide-react";
import { login } from "@/lib/auth";
import { getLang } from "@/lib/i18n";
import { consumeRateLimit, requestFingerprint } from "@/lib/rateLimit";
import { writeAudit } from "@/lib/management";

const field = "mt-1.5 w-full rounded-xl border border-pine-100 bg-white px-4 py-3 text-base outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-100";

export const metadata = { title: "Staff sign in" };

export default async function Login({ searchParams }) {
  const { error, wait } = await searchParams;
  const bn = (await getLang()) === "bn";
  const tr = (en, b) => (bn ? b : en);

  async function go(fd) {
    "use server";
    const h = await headers();
    const fingerprint = requestFingerprint(h);
    const username = String(fd.get("username") || "").trim().toLowerCase().slice(0, 40);
    const userLimit = await consumeRateLimit({ scope: "admin-login-user", key: fingerprint + ":" + (username || "unknown"), limit: 5, windowMs: 600000 });
    const addressLimit = await consumeRateLimit({ scope: "admin-login-address", key: fingerprint, limit: 20, windowMs: 600000 });
    if (userLimit.unavailable || addressLimit.unavailable) redirect("/admin/login?error=unavailable");
    const blocked = [userLimit, addressLimit].find((item) => !item.allowed);
    if (blocked) {
      const wait = Math.max(1, Math.ceil(((blocked.resetAt || Date.now() + 600000) - Date.now()) / 60000));
      redirect("/admin/login?error=locked&wait=" + wait);
    }

    const ok = await login(username, String(fd.get("password") || ""));
    if (!ok) {
      await writeAudit({ actor: { u: username || "unknown", name: username || "unknown" }, action: "login.failed", targetType: "session", targetId: fingerprint });
      redirect("/admin/login?error=1");
    }
    await writeAudit({ actor: { u: username, name: username }, action: "login.success", targetType: "session", targetId: fingerprint });
    redirect("/admin");
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-pine-900 text-white"><HeartPulse size={26} /></span>
          <span className="font-serif text-2xl font-semibold text-pine-950">{tr("Ibn Sina Trust", "ইবনে সিনা ট্রাস্ট")}</span>
        </div>
        <div className="rounded-3xl border border-pine-100 bg-white p-7 shadow-xl shadow-pine-900/5 sm:p-9">
          <span className="grid size-11 place-items-center rounded-xl bg-pine-50 text-pine-800"><LockKeyhole size={20} /></span>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-pine-950">{tr("Staff sign in", "কর্মী সাইন ইন")}</h1>
          <p className="mt-2 text-sm leading-6 text-ink/70">{tr("Use the username and password given to you by the hospital.", "হাসপাতাল থেকে পাওয়া ইউজারনেম ও পাসওয়ার্ড ব্যবহার করুন।")}</p>
          <form action={go} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-pine-900">{tr("Username", "ইউজারনেম")}
              <input name="username" required autoFocus autoCapitalize="none" autoComplete="username" className={field} />
            </label>
            <label className="block text-sm font-semibold text-pine-900">{tr("Password", "পাসওয়ার্ড")}
              <input name="password" type="password" required autoComplete="current-password" className={field} />
            </label>
            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {error === "locked"
                  ? tr(`Too many attempts. Try again in ${wait || 10} minutes.`, `অনেকবার ভুল চেষ্টা হয়েছে। ${wait || 10} মিনিট পরে আবার চেষ্টা করুন।`)
                  : tr("Wrong username or password. Try again.", "ইউজারনেম বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।")}
              </p>
            )}
            <button className="w-full rounded-xl bg-pine-900 px-6 py-3.5 text-base font-bold text-white transition hover:bg-pine-800">{tr("Sign in", "সাইন ইন")}</button>
          </form>
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-ink/55"><ShieldCheck size={14} className="mt-0.5 shrink-0" />{tr("Staff area. Sign-in attempts are recorded.", "এটি কর্মীদের এলাকা। সাইন ইনের চেষ্টা রেকর্ড করা হয়।")}</p>
        </div>
        <p className="mt-5 text-center text-sm"><a href="/" className="font-semibold text-pine-700 hover:text-pine-900">← {tr("Back to website", "ওয়েবসাইটে ফিরুন")}</a></p>
      </div>
    </div>
  );
}
