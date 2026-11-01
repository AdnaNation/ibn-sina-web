import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import Services from "@/components/Services";
import Doctors from "@/components/Doctors";
import WhyTrust from "@/components/WhyTrust";
import Units from "@/components/Units";
import Faq from "@/components/Faq";
import Banner from "@/components/Banner";
import EmergencyStrip from "@/components/EmergencyStrip";
import { getUnits, getServices, getDepartments, getFeaturedDoctors } from "@/lib/data";

export default async function Home() {
  const [units, services, departments, doctors] = await Promise.all([
    getUnits(),
    getServices(),
    getDepartments(),
    getFeaturedDoctors(),
  ]);

  // Structured data helps Google show the hospital's name, phone and address.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: "The Ibn Sina Trust",
    alternateName: "ইবনে সিনা ট্রাস্ট",
    foundingDate: "1980-06",
    telephone: "+88-09610010615",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.ibnsinatrust.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "House 48, Road 9/A, Dhanmondi",
      addressLocality: "Dhaka",
      postalCode: "1209",
      addressCountry: "BD",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EmergencyStrip />
      <Hero units={units} departments={departments} />
      <Stats units={units} departments={departments} />
      <HowItWorks />
      <Services services={services} />
      <Doctors doctors={doctors} />
      <WhyTrust />
      <Units units={units} />
      <Faq />
      <Banner />
    </>
  );
}
