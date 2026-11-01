import Link from "next/link";
import { SearchX } from "lucide-react";
import { getT } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <>
      <Navbar />
      <main className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-20 text-center">
        <div>
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-pine-50 text-pine-800"><SearchX size={30} /></span>
          <h1 className="mt-6 font-serif text-3xl font-semibold text-pine-950">{t.nfTitle}</h1>
          <p className="mt-3 leading-7 text-slate-600">{t.nfText}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-pine-800 px-6 py-3 text-sm font-bold text-white hover:bg-pine-700">{t.goHome}</Link>
            <Link href="/doctors" className="rounded-full border border-pine-200 px-6 py-3 text-sm font-bold text-pine-900 hover:bg-pine-50">{t.find}</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
