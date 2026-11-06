import { notFound } from "next/navigation";
import LiveTicket from "@/components/LiveTicket";
import { getTracking } from "@/lib/queue";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Queue Status Demo | Independent Healthcare Prototype",
  description: "Private tracking view for the independent queue demonstration.",
  robots: { index: false, follow: false },
};

export default async function TrackPage({ params, searchParams }) {
  const [{ ref }, sp, { lang }] = await Promise.all([params, searchParams, getT()]);
  const ticket = await getTracking(decodeURIComponent(ref));
  if (!ticket) notFound();
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <LiveTicket initial={ticket} isNew={sp.new === "1"} lang={lang} allowCancel={process.env.ENABLE_PUBLIC_CANCELLATION === "true"} />
    </div>
  );
}
