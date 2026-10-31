import { notFound } from "next/navigation";
import LiveTicket from "@/components/LiveTicket";
import { getTracking } from "@/lib/queue";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your queue status | Ibn Sina Trust" };

export default async function TrackPage({ params, searchParams }) {
  const [{ ref }, sp, { lang }] = await Promise.all([params, searchParams, getT()]);
  const ticket = await getTracking(decodeURIComponent(ref));
  if (!ticket) notFound();
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <LiveTicket initial={ticket} isNew={sp.new === "1"} lang={lang} />
    </div>
  );
}
