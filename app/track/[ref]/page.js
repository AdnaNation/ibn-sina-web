import { notFound } from "next/navigation";
import LiveTicket from "@/components/LiveTicket";
import { getTracking } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your queue status | Ibn Sina Trust" };

export default async function TrackPage({ params, searchParams }) {
  const [{ ref }, sp] = await Promise.all([params, searchParams]);
  const t = await getTracking(decodeURIComponent(ref));
  if (!t) notFound();
  return (
    <div className="max-w-xl px-4 py-10 mx-auto">
      <LiveTicket initial={t} isNew={sp.new === "1"} />
    </div>
  );
}
