export default function robots() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ibnsinatrust.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/track"] }],
    sitemap: `${site}/sitemap.xml`,
  };
}
