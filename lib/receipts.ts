import type { OutcomeContract, ProofReceipt, TestResult } from "@/lib/domain";
import { hashCanonicalJson } from "@/lib/hashing/sha256";
import { scoreResults } from "@/lib/scoring/verdict";

const id = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;

export function createProofReceipt(contract: OutcomeContract, results: TestResult[]): ProofReceipt {
  const contractHash = hashCanonicalJson(contract);
  const evidenceHash = hashCanonicalJson(results);
  const scores = scoreResults(results);
  return {
    receiptId: id("receipt"),
    auditId: id("audit"),
    contractId: contract.id,
    contractHash,
    evidenceHash,
    verdict: scores.verdict,
    recommendedAction: scores.recommendedAction,
    completionScore: scores.completionScore,
    confidenceScore: scores.confidenceScore,
    passed: scores.passed,
    failed: scores.failed,
    warnings: scores.warnings,
    skipped: scores.skipped,
    generatedAt: new Date().toISOString(),
    results,
    limitations: [
      "Receipt evidence is hashed with SHA-256 and is not yet anchored onchain.",
      "Repository checks are static unless a controlled verification workflow is explicitly installed.",
      "AI advisory checks, when available, are informational and cannot override deterministic failures."
    ]
  };
}

export function receiptToMarkdown(receipt: ProofReceipt): string {
  const lines = [
    `# OutcomeOS Proof Receipt`,
    ``,
    `Receipt ID: ${receipt.receiptId}`,
    `Verdict: ${receipt.verdict}`,
    `Recommended action: ${receipt.recommendedAction}`,
    `Completion score: ${receipt.completionScore}%`,
    `Evidence hash: ${receipt.evidenceHash}`,
    `Contract hash: ${receipt.contractHash}`,
    ``,
    `## Results`,
    ...receipt.results.map((result) => `- ${result.status.toUpperCase()}: ${result.summary}`)
  ];
  return lines.join("\n");
}

export function verifyReceiptIntegrity(receipt: ProofReceipt): boolean {
  return hashCanonicalJson(receipt.results) === receipt.evidenceHash;
}

const sensitiveKey = /email|token|authorization|cookie|secret|private[_-]?url/iu;
export function redactPublicValue(value: unknown, key = ""): unknown {
  if (sensitiveKey.test(key)) return "[redacted]";
  if (typeof value === "string") {
    return value
      .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/gu, "[redacted email]")
      .replace(/(bearer\s+|api[_-]?key[=: ]+)[A-Za-z0-9._-]{12,}/giu, "$1[redacted]");
  }
  if (Array.isArray(value)) return value.map((entry) => redactPublicValue(entry));
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redactPublicValue(child, childKey)]));
  }
  return value;
}
