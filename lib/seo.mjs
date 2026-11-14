const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export function getPublicSiteUrl() {
  if (!configuredSiteUrl) return null;
  try {
    const url = new URL(configuredSiteUrl);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

// Search indexing stays disabled unless an owner explicitly enables it on a
// verified HTTPS domain after institutional authorization and content review.
export function isSearchIndexingEnabled() {
  return process.env.ENABLE_SEARCH_INDEXING === "true" && Boolean(getPublicSiteUrl());
}

export function getPageRobots({ indexable = false } = {}) {
  const index = indexable && isSearchIndexingEnabled();
  return {
    index,
    follow: index,
    googleBot: { index, follow: index },
  };
}
