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
  countDoctors,
} from "@/lib/data";

export const revalidate = 300; // refresh from MongoDB every 5 minutes

export default async function Home() {
  const [units, services, departments, doctors, doctorCount] =
    await Promise.all([
      getUnits(),
      getServices(),
      getDepartments(),
      getFeaturedDoctors(),
      countDoctors(),
    ]);
  return (
    <>
      <Hero units={units} departments={departments} />
      <Stats units={units} doctorCount={doctorCount} />
      <Services services={services} />
      <Doctors doctors={doctors} />
      <Units units={units} />
      <Banner />
    </>
  );
}
