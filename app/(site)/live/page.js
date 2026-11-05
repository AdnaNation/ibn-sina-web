import LiveBoard from "@/components/LiveBoard";
import { getBoard } from "@/lib/queue";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Queue Demo | Independent Healthcare Prototype", description: "Demonstration-only live queue board; not an official hospital service.", robots: { index: false, follow: false } };

export default async function LivePage() {
  const [{ lang }, initial] = await Promise.all([getT(), getBoard()]);
  return <LiveBoard initial={initial} lang={lang} />;
}
