import * as cheerio from "cheerio";
import { validateSafeUrl } from "../utils/ssrf.js";
import { ApiError } from "../utils/apiError.js";

const MAX_HTML_BYTES = 512 * 1024; // 512 KB to prevent memory bombs

/**
 * Service to fetch and extract OpenGraph and standard HTML metadata from URLs.
 * Fully protected against SSRF and resource exhaustion.
 */
export async function extractUrlMetadata(targetUrl) {
  const safeUrl = await validateSafeUrl(targetUrl);

  let response;
  try {
    response = await fetch(safeUrl.href, {
      method: "GET",
      signal: AbortSignal.timeout(6000), // 6-second timeout
      headers: {
        "User-Agent": "Kruu-MetadataBot/2.0 (+https://kruu.dev)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new ApiError(504, "Target URL timed out while fetching metadata.");
    }
    throw new ApiError(502, `Failed to reach target URL: ${err.message}`);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status >= 500 ? 502 : response.status,
      `Target server responded with HTTP status ${response.status} (${response.statusText})`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
    throw new ApiError(400, `Target URL returned non-HTML content type: ${contentType}`);
  }

  // Read response with length limit
  const buffer = await response.arrayBuffer();
  const truncatedBuffer = buffer.slice(0, MAX_HTML_BYTES);
  const html = new TextDecoder("utf-8").decode(truncatedBuffer);

  const $ = cheerio.load(html);

  // Extract titles
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").text().trim() ||
    null;

  // Extract descriptions
  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    null;

  // Extract images
  const ogImage =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null;

  let imageUrl = null;
  if (ogImage) {
    try {
      imageUrl = new URL(ogImage, safeUrl.href).href;
    } catch {
      imageUrl = null;
    }
  }

  // Extract site name
  const siteName =
    $('meta[property="og:site_name"]').attr("content") ||
    safeUrl.hostname;

  // Extract favicon
  const rawFavicon =
    $('link[rel="apple-touch-icon"]').attr("href") ||
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    "/favicon.ico";

  let faviconUrl = null;
  try {
    faviconUrl = new URL(rawFavicon, safeUrl.href).href;
  } catch {
    faviconUrl = null;
  }

  // Canonical URL
  const canonical = $('link[rel="canonical"]').attr("href") || null;
  let canonicalUrl = null;
  if (canonical) {
    try {
      canonicalUrl = new URL(canonical, safeUrl.href).href;
    } catch {
      canonicalUrl = null;
    }
  }

  return {
    url: safeUrl.href,
    protocol: safeUrl.protocol,
    hostname: safeUrl.hostname,
    title: title ? title.slice(0, 300) : null,
    description: description ? description.slice(0, 1000) : null,
    image: imageUrl,
    favicon: faviconUrl,
    siteName,
    canonical: canonicalUrl,
    statusCode: response.status,
    contentType,
  };
}
