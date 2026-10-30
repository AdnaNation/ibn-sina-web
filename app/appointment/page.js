import AppointmentForm from "./AppointmentForm";
import { getAllDoctors } from "@/lib/data";
import { todayDhaka } from "@/lib/time";

export const metadata = { title: "Book an appointment | Ibn Sina Trust" };
export const dynamic = "force-dynamic";

export default async function AppointmentPage({ searchParams }) {
  const { doctor } = await searchParams;
  const doctors = await getAllDoctors();
  return (
    <div className="max-w-3xl px-4 mx-auto py-14">
      <h1 className="font-serif text-4xl md:text-5xl text-pine-900">
        Book an appointment
      </h1>
      <p className="mt-3 mb-10 text-ink/70">
        You get a serial number straight away and can follow the queue live from
        home. In an emergency, call 10615.
      </p>
      <AppointmentForm
        doctors={doctors}
        selected={doctor}
        minDate={todayDhaka()}
        maxDate={todayDhaka(14)}
      />
    </div>
  );
}
