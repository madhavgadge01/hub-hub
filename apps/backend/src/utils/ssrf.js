import dns from "dns/promises";
import net from "net";
import { ApiError } from "./apiError.js";

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
function isPrivateIpv4(ip) {
  const parts = ip.split(".").map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true;
  }

  // 0.0.0.0/8
  if (parts[0] === 0) return true;
  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;
  // 10.0.0.0/8 (Private)
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (Link-Local & Cloud Instance Metadata like AWS/GCP 169.254.169.254)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  // 224.0.0.0/4 (Multicast)
  if (parts[0] >= 224 && parts[0] <= 239) return true;
  // 240.0.0.0/4 (Reserved)
  if (parts[0] >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a private, loopback, or link-local range.
 */
function isPrivateIpv6(ip) {
  const normalized = ip.toLowerCase();
  // Loopback ::1
  if (normalized === "::1" || normalized === "0000:0000:0000:0000:0000:0000:0000:0001") return true;
  // Unspecified ::
  if (normalized === "::" || normalized === "0000:0000:0000:0000:0000:0000:0000:0000") return true;
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.startsWith("::ffff:") || normalized.startsWith("0:0:0:0:0:ffff:")) {
    const ipv4Part = normalized.split(":").pop();
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIpv4(ipv4Part);
    }
  }
  // Unique local addresses (fc00::/7)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  // Link-local addresses (fe80::/10)
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;

  return false;
}

/**
 * Validates a target URL against SSRF attacks.
 * Verifies protocol, blocks local hostnames, and resolves DNS to ensure the destination IP is public.
 */
export async function validateSafeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new ApiError(400, "URL string is required.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch {
    throw new ApiError(400, "Invalid URL format.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new ApiError(400, "Only HTTP and HTTPS URLs are supported.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block obvious local names
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname === "metadata.google.internal"
  ) {
    throw new ApiError(400, "Access to localhost or internal network endpoints is restricted.");
  }

  // If hostname is already a raw IP
  if (net.isIPv4(hostname)) {
    if (isPrivateIpv4(hostname)) {
      throw new ApiError(400, "Requests to private/internal network addresses are forbidden.");
    }
    return parsedUrl;
  }

  if (net.isIPv6(hostname)) {
    if (isPrivateIpv6(hostname)) {
      throw new ApiError(400, "Requests to private IPv6 addresses are forbidden.");
    }
    return parsedUrl;
  }

  // Resolve hostname via DNS and check all resolved IP addresses
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new ApiError(400, "Could not resolve DNS records for the specified host.");
    }

    for (const record of addresses) {
      if (record.family === 4 && isPrivateIpv4(record.address)) {
        throw new ApiError(400, "Hostname resolves to a private or restricted network address.");
      }
      if (record.family === 6 && isPrivateIpv6(record.address)) {
        throw new ApiError(400, "Hostname resolves to a private or restricted IPv6 address.");
      }
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(400, `DNS resolution failed: ${err.message}`);
  }

  return parsedUrl;
}
