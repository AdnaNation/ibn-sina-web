import LiveBoard from "@/components/LiveBoard";
import { getBoard } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live queue | Ibn Sina Trust" };

export default async function LivePage() {
  return <LiveBoard initial={await getBoard()} />;
}
