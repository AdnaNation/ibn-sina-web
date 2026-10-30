import { redirect } from "next/navigation";

export const metadata = { title: "Track my turn | Ibn Sina Trust" };

export default async function TrackLookup({ searchParams }) {
  const { code } = await searchParams;
  if (code) redirect(`/track/${encodeURIComponent(code.trim().toUpperCase())}`);
  return (
    <div className="max-w-md px-4 py-20 mx-auto">
      <h1 className="font-serif text-4xl text-pine-900">Track my turn</h1>
      <p className="mt-3 text-ink/70">
        Enter the tracking code you received when you booked.
      </p>
      <form className="flex gap-3 mt-8">
        <input
          name="code"
          required
          placeholder="IST-7K3F9Q"
          aria-label="Tracking code"
          className="flex-1 px-3 py-3 uppercase bg-white border rounded-lg border-pine-100 focus:border-pine-600"
        />
        <button className="px-6 font-semibold text-white rounded-full bg-pine-900 hover:bg-pine-700">
          Track
        </button>
      </form>
    </div>
  );
}
