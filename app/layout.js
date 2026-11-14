import { Newsreader, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n";
import { getPageRobots, getPublicSiteUrl } from "@/lib/seo.mjs";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Noto_Sans_Bengali({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const SITE = getPublicSiteUrl() || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function generateMetadata() {
  const lang = await getLang();
  const bn = lang === "bn";
  const title = bn
    ? "স্বাস্থ্যসেবা ও লাইভ সিরিয়াল | স্বাধীন প্রোটোটাইপ"
    : "Healthcare Website & Live Queue | Independent Prototype";
  const description = bn
    ? "হাসপাতালের ওয়েবসাইট ও লাইভ সিরিয়াল ব্যবস্থার একটি স্বাধীন প্রদর্শনীমূলক প্রোটোটাইপ। এটি কোনো হাসপাতালের আনুষ্ঠানিক ওয়েবসাইট বা অনুমোদিত বুকিং সেবা নয়।"
    : "An independent demonstration prototype of a hospital website and live queue experience. This is not an official hospital website or an authorized booking service.";
  return {
    metadataBase: new URL(SITE),
    title,
    description,
    openGraph: { title, description, siteName: bn ? "স্বাধীন স্বাস্থ্যসেবা প্রোটোটাইপ" : "Independent Healthcare Prototype", locale: bn ? "bn_BD" : "en_GB", type: "website" },
    twitter: { card: "summary", title, description },
    robots: getPageRobots({ indexable: true }),
    ...(getPublicSiteUrl() ? { alternates: { canonical: "/" } } : {}),
  };
}

export const viewport = { themeColor: "#02281F", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
