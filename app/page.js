import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Doctors from "@/components/Doctors";
import Units from "@/components/Units";
import Banner from "@/components/Banner";
import {
  getUnits,
  getServices,
  getDepartments,
  getFeaturedDoctors,
} from "@/lib/data";

export const revalidate = 300; // refresh published directory data from MongoDB every 5 minutes

export default async function Home() {
  const [units, services, departments, doctors] = await Promise.all([
    getUnits(),
    getServices(),
    getDepartments(),
    getFeaturedDoctors(),
  ]);
  return (
    <>
      <Hero units={units} departments={departments} />
      <Stats />
      <Services services={services} />
      <Doctors doctors={doctors} />
      <Units units={units} />
      <Banner />
    </>
  );
}
