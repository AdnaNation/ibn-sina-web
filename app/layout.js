import { Newsreader, Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const serifBn = Noto_Serif_Bengali({ subsets: ["bengali"], variable: "--font-serif-bn", display: "swap" });
const sans = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function generateMetadata() {
  const lang = await getLang();
  const bn = lang === "bn";
  const title = bn
    ? "ইবনে সিনা ট্রাস্ট | হাসপাতাল, ডাক্তার ও ডায়াগনস্টিক সেবা"
    : "Ibn Sina Trust | Hospitals, Doctors & Healthcare Services";
  const description = bn
    ? "ইবনে সিনা ট্রাস্টের হাসপাতাল ও ডায়াগনস্টিক সেন্টারে ডাক্তার খুঁজুন, অনলাইনে সিরিয়াল নিন এবং আপনার পালা লাইভ দেখুন। হটলাইন ১০৬১৫।"
    : "Find a doctor, book a serial and track your turn live at Ibn Sina Trust hospitals and diagnostic centres. Hotline 10615.";
  return {
    metadataBase: new URL(SITE),
    title,
    description,
    openGraph: { title, description, siteName: bn ? "স্বাধীন স্বাস্থ্যসেবা প্রোটোটাইপ" : "Independent Healthcare Prototype", locale: bn ? "bn_BD" : "en_GB", type: "website" },
    twitter: { card: "summary", title, description },
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export const viewport = { themeColor: "#02281F", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${serif.variable} ${serifBn.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
