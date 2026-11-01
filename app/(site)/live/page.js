import LiveBoard from "@/components/LiveBoard";
import { getBoard } from "@/lib/queue";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live queue | Ibn Sina Trust" };

export default async function LivePage() {
  const [{ lang }, initial] = await Promise.all([getT(), getBoard()]);
  return <LiveBoard initial={initial} lang={lang} />;
}
