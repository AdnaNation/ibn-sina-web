import test from "node:test";
import assert from "node:assert/strict";
import { getPageRobots, getPublicSiteUrl, isSearchIndexingEnabled } from "../lib/seo.mjs";

const originalFlag = process.env.ENABLE_SEARCH_INDEXING;
const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;

test("search indexing is disabled by default", () => {
  delete process.env.ENABLE_SEARCH_INDEXING;
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.org";
  assert.equal(isSearchIndexingEnabled(), false);
  assert.equal(getPageRobots({ indexable: true }).index, false);
});

test("search indexing requires explicit opt-in and a valid HTTPS site URL", () => {
  process.env.ENABLE_SEARCH_INDEXING = "true";
  process.env.NEXT_PUBLIC_SITE_URL = "http://example.org";
  assert.equal(isSearchIndexingEnabled(), false);
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.org/path";
  assert.equal(isSearchIndexingEnabled(), true);
  assert.equal(getPublicSiteUrl(), "https://example.org");
});

test("non-indexable routes remain noindex even after opt-in", () => {
  process.env.ENABLE_SEARCH_INDEXING = "true";
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.org";
  assert.equal(getPageRobots({ indexable: false }).index, false);
});

test.after(() => {
  if (originalFlag === undefined) delete process.env.ENABLE_SEARCH_INDEXING;
  else process.env.ENABLE_SEARCH_INDEXING = originalFlag;
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
});
