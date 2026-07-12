import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const privateV4Ranges = [
  ["10.0.0.0", 8],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["0.0.0.0", 8]
] as const;

export type SafeUrlResult = {
  url: URL;
  resolvedAddresses: string[];
};

export async function validatePublicHttpUrl(raw: string): Promise<SafeUrlResult> {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only HTTP and HTTPS URLs are allowed.");
  if (url.username || url.password) throw new Error("URLs with embedded credentials are not allowed.");
  if (url.hostname === "localhost") throw new Error("Localhost is not allowed.");
  if (isUnsafeHostLiteral(url.hostname)) throw new Error("Private, loopback and link-local addresses are not allowed.");
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (records.length === 0) throw new Error("DNS resolution returned no records.");
  for (const record of records) {
    if (isUnsafeIp(record.address)) throw new Error("DNS resolved to a private or unsafe address.");
  }
  return { url, resolvedAddresses: records.map((record) => record.address) };
}

function isUnsafeHostLiteral(hostname: string): boolean {
  const stripped = hostname.replace(/^\[/u, "").replace(/\]$/u, "");
  return isIP(stripped) !== 0 && isUnsafeIp(stripped);
}

export function isUnsafeIp(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPrivateV4(address);
  if (version === 6) {
    const lower = address.toLowerCase();
    return (
      lower === "::1" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe80") ||
      lower === "::" ||
      lower.startsWith("::ffff:127.") ||
      lower.startsWith("::ffff:10.") ||
      lower.startsWith("::ffff:192.168.")
      || lower.startsWith("::ffff:172.")
    );
  }
  return false;
}

function isPrivateV4(address: string): boolean {
  const value = ipv4ToNumber(address);
  return privateV4Ranges.some(([range, bits]) => {
    const mask = (0xffffffff << (32 - bits)) >>> 0;
    return (value & mask) === (ipv4ToNumber(range) & mask);
  });
}

function ipv4ToNumber(address: string): number {
  return address.split(".").reduce((sum, part) => (sum << 8) + Number(part), 0) >>> 0;
}
