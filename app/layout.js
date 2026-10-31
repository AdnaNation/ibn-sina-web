import {
  Newsreader,
  Hind_Siliguri,
  Noto_Serif_Bengali,
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLang } from "@/lib/i18n";

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const serifBn = Noto_Serif_Bengali({
  subsets: ["bengali"],
  variable: "--font-serif-bn",
  display: "swap",
});
const sans = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Ibn Sina Trust | Hospitals, Doctors & Healthcare Services",
  description:
    "Explore Ibn Sina Trust hospitals, diagnostic centres and consultation services. Find a doctor, book an appointment and track your serial. Hotline 10615.",
};

export default async function RootLayout({ children }) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${serif.variable} ${serifBn.variable} ${sans.variable}`}
    >
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
