import type { AcceptanceTest } from "@/lib/domain";
import type { Verifier } from "@/lib/verification/types";
import { makeResult } from "@/lib/verification/types";

const supported = new Set<AcceptanceTest["verificationType"]>([
  "content_length",
  "content_contains",
  "content_excludes",
  "section_exists",
  "link_validation",
  "semantic_advisory"
]);

export class ContentVerifier implements Verifier<string> {
  supports(test: AcceptanceTest): boolean {
    return supported.has(test.verificationType);
  }

  async execute(test: AcceptanceTest, input: string) {
    const startedAt = new Date().toISOString();
    const lower = input.toLowerCase();
    if (test.verificationType === "content_length") {
      const expected = readLengthExpected(test.expected);
      const words = input.trim().split(/\s+/u).filter(Boolean).length;
      const ok = words >= expected.minWords && (expected.maxWords === undefined || words <= expected.maxWords);
      return makeResult(test, startedAt, ok ? "pass" : "fail", { words }, `Content contains ${words} words.`);
    }
    if (test.verificationType === "content_contains") {
      const phrase = String(test.expected ?? "").toLowerCase();
      const ok = lower.includes(phrase);
      return makeResult(test, startedAt, ok ? "pass" : "fail", { present: ok }, `Required phrase "${phrase}" ${ok ? "was" : "was not"} found.`);
    }
    if (test.verificationType === "content_excludes") {
      const forbidden = Array.isArray(test.expected) ? test.expected.map(String) : [String(test.expected ?? "")];
      const found = forbidden.filter((phrase) => lower.includes(phrase.toLowerCase()));
      return makeResult(test, startedAt, found.length === 0 ? "pass" : "fail", { found }, found.length === 0 ? "No forbidden phrases found." : `Forbidden phrases found: ${found.join(", ")}.`);
    }
    if (test.verificationType === "section_exists") {
      const section = String(test.expected ?? test.target ?? "");
      const regex = new RegExp(`(^|\\n)#{1,3}\\s+${escapeRegExp(section)}`, "iu");
      const ok = regex.test(input);
      return makeResult(test, startedAt, ok ? "pass" : "fail", { section, present: ok }, `Section "${section}" ${ok ? "exists" : "is missing"}.`);
    }
    if (test.verificationType === "link_validation") {
      const links = [...input.matchAll(/https?:\/\/[^\s)]+/giu)].map((match) => match[0]);
      return makeResult(test, startedAt, links.length > 0 ? "pass" : "warning", { links }, `${links.length} public links detected.`);
    }
    return makeResult(test, startedAt, "warning", "AI advisory unavailable in deterministic fallback.", "AI ADVISORY - HUMAN REVIEW REQUIRED.", [], false);
  }
}

function readLengthExpected(value: unknown): { minWords: number; maxWords?: number } {
  if (typeof value === "object" && value !== null) {
    const candidate = value as { minWords?: unknown; maxWords?: unknown };
    return {
      minWords: typeof candidate.minWords === "number" ? candidate.minWords : 0,
      maxWords: typeof candidate.maxWords === "number" ? candidate.maxWords : undefined
    };
  }
  return { minWords: 0 };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
