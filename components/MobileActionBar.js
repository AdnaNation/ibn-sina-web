import Link from "next/link";
import { Phone, CalendarCheck, Activity, Radio } from "lucide-react";
import { getT } from "@/lib/i18n";

// Most patients use a phone: keep the 4 most important actions one tap away.
export default async function MobileActionBar() {
  const { t } = await getT();
  const items = [
    [Phone, t.mbCall, "tel:10615", false],
    [CalendarCheck, t.mbBook, "/appointment", true],
    [Activity, t.mbTrack, "/track", false],
    [Radio, t.mbLive, "/live", false],
  ];
  return (
    <nav aria-label="Quick actions" className="fixed inset-x-0 bottom-0 z-40 border-t border-pine-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(9,54,40,.08)] backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(([Icon, label, href, primary]) => (
          <li key={href}>
            <a href={href} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold ${primary ? "text-pine-800" : "text-slate-600"}`}>
              <span className={`grid size-9 place-items-center rounded-full ${primary ? "bg-pine-800 text-white" : "bg-pine-50 text-pine-800"}`}><Icon size={18} /></span>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
