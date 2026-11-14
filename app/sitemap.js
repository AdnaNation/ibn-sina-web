import { getPublicSiteUrl, isSearchIndexingEnabled } from "@/lib/seo.mjs";

export default function sitemap() {
  const siteUrl = getPublicSiteUrl();
  if (!isSearchIndexingEnabled() || !siteUrl) return [];

  // Only stable public directory pages belong here. Transactional, patient,
  // queue, demo and staff routes are intentionally excluded.
  return ["/", "/doctors", "/units"].map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
