import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";
import PrototypeNotice from "@/components/PrototypeNotice";

// Public website shell. Staff/admin pages live outside this group so they
// never show the public header, footer or patient action bar.
export default function SiteLayout({ children }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-pine-900 focus:shadow-lg"
      >
        Skip to content
      </a>
      <PrototypeNotice />
      <Navbar />
      <main id="main" className="pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
