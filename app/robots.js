import { getPublicSiteUrl, isSearchIndexingEnabled } from "@/lib/seo.mjs";

export default function robots() {
  const siteUrl = getPublicSiteUrl();
  if (!isSearchIndexingEnabled()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/appointment",
        "/track",
        "/live",
        "/medical-reports",
        "/user-manual",
        "/demo",
      ],
    }],
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
