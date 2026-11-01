import { getUnits, getAllDoctors } from "@/lib/data";

export default async function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ibnsinatrust.com";
  const [units, doctors] = await Promise.all([getUnits(), getAllDoctors()]);
  const now = new Date();
  return [
    ...["", "/doctors", "/units", "/appointment", "/live"].map((p) => ({ url: site + p, lastModified: now })),
    ...units.map((u) => ({ url: `${site}/units/${u.slug}`, lastModified: now })),
    ...doctors.map((d) => ({ url: `${site}/doctors/${d.slug}`, lastModified: now })),
  ];
}
