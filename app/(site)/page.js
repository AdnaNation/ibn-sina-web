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

  return (
    <>
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
