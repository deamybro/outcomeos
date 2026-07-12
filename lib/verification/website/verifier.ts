import * as cheerio from "cheerio";
import type { AcceptanceTest, EvidenceItem } from "@/lib/domain";
import { validatePublicHttpUrl } from "@/lib/security/url";
import type { VerificationContext, Verifier } from "@/lib/verification/types";
import { makeResult } from "@/lib/verification/types";

export type WebsiteInput = {
  url: string;
};

const supported = new Set<AcceptanceTest["verificationType"]>([
  "http_status",
  "https_required",
  "page_contains",
  "link_exists",
  "link_status",
  "meta_present",
  "viewport_present"
]);

export class WebsiteVerifier implements Verifier<WebsiteInput> {
  private cachedPage: Promise<FetchedPage> | undefined;

  supports(test: AcceptanceTest): boolean {
    return supported.has(test.verificationType);
  }

  async execute(test: AcceptanceTest, input: WebsiteInput, context: VerificationContext) {
    const startedAt = new Date().toISOString();
    const page = await this.fetchPage(input.url, context);
    if (test.verificationType === "http_status") {
      const expected = typeof test.expected === "number" ? test.expected : 200;
      return makeResult(
        test,
        startedAt,
        page.status === expected ? "pass" : "fail",
        page.status,
        `Website returned HTTP ${page.status}.`,
        pageEvidence(page)
      );
    }
    if (test.verificationType === "https_required") {
      const ok = page.finalUrl.startsWith("https://");
      return makeResult(test, startedAt, ok ? "pass" : "fail", page.finalUrl, ok ? "Website uses HTTPS." : "Website did not resolve to HTTPS.", pageEvidence(page));
    }
    if (test.verificationType === "page_contains") {
      const expected = String(test.expected ?? test.target ?? "");
      const ok = page.text.toLowerCase().includes(expected.toLowerCase());
      return makeResult(test, startedAt, ok ? "pass" : "fail", { contains: ok }, `Required text "${expected}" ${ok ? "was" : "was not"} found.`, pageEvidence(page));
    }
    if (test.verificationType === "meta_present") {
      const metaName = String(test.expected ?? "description");
      const present = page.$(`meta[name="${metaName}"], meta[property="${metaName}"]`).length > 0;
      return makeResult(test, startedAt, present ? "pass" : "fail", { metaName, present }, `Meta "${metaName}" ${present ? "exists" : "is missing"}.`, pageEvidence(page));
    }
    if (test.verificationType === "viewport_present") {
      const present = page.$('meta[name="viewport"]').length > 0;
      return makeResult(test, startedAt, present ? "pass" : "fail", { present }, `Mobile viewport meta ${present ? "exists" : "is missing"}.`, pageEvidence(page));
    }
    if (test.verificationType === "link_exists") {
      const expected = String(test.expected ?? test.target ?? "");
      const present = page.$(`a[href*="${cssEscape(expected)}"]`).length > 0;
      return makeResult(test, startedAt, present ? "pass" : "fail", { expected, present }, `Link containing "${expected}" ${present ? "exists" : "is missing"}.`, pageEvidence(page));
    }
    if (test.verificationType === "link_status") {
      const target = new URL(String(test.target ?? test.expected ?? "/"), page.finalUrl).toString();
      await validatePublicHttpUrl(target);
      const response = await fetch(target, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(context.timeoutMs) });
      const ok = response.status >= 200 && response.status < 400;
      return makeResult(test, startedAt, ok ? "pass" : "fail", response.status, `Link returned HTTP ${response.status}.`, [
        ...pageEvidence(page),
        { type: "http", label: "Checked link", value: target, redacted: false }
      ]);
    }
    return makeResult(test, startedAt, "skipped", null, "Website test was not implemented.");
  }

  private fetchPage(url: string, context: VerificationContext): Promise<FetchedPage> {
    this.cachedPage ??= fetchSafePage(url, context);
    return this.cachedPage;
  }
}

type FetchedPage = {
  finalUrl: string;
  status: number;
  contentType: string;
  text: string;
  $: cheerio.CheerioAPI;
  resolvedAddresses: string[];
};

async function fetchSafePage(rawUrl: string, context: VerificationContext): Promise<FetchedPage> {
  const safe = await validatePublicHttpUrl(rawUrl);
  const response = await fetch(safe.url, {
    headers: { "user-agent": "OutcomeOS/0.1 proof-check (+https://outcomeos.local)" },
    redirect: "follow",
    signal: AbortSignal.timeout(context.timeoutMs)
  });
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) throw new Error(`Expected HTML response but received ${contentType || "unknown content type"}.`);
  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentLength > 1_000_000) throw new Error("Target response is too large.");
  const text = await response.text();
  if (text.length > 1_000_000) throw new Error("Target response is too large.");
  return {
    finalUrl: response.url,
    status: response.status,
    contentType,
    text,
    $: cheerio.load(text),
    resolvedAddresses: safe.resolvedAddresses
  };
}

function pageEvidence(page: FetchedPage): EvidenceItem[] {
  return [
    { type: "http", label: "Final URL", value: page.finalUrl, redacted: false },
    { type: "http", label: "Status", value: page.status, redacted: false },
    { type: "security", label: "Resolved addresses", value: page.resolvedAddresses, redacted: false }
  ];
}

function cssEscape(value: string): string {
  return value.replace(/["\\]/gu, "\\$&");
}
