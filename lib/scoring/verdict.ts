import type { ProofReceipt, TestResult } from "@/lib/domain";

const weights = {
  critical: 5,
  high: 3,
  medium: 2,
  low: 1
} as const;

export function scoreResults(results: TestResult[]) {
  const objective = results.filter((result) => result.objective);
  const possible = objective.reduce((sum, result) => sum + weights[result.severity], 0);
  const earned = objective.reduce((sum, result) => {
    if (result.status === "pass") return sum + weights[result.severity];
    if (result.status === "warning") return sum + weights[result.severity] * 0.5;
    return sum;
  }, 0);
  const completionScore = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  const inconclusive = results.filter((result) => result.status === "skipped" || result.status === "error").length;
  const confidenceScore = Math.max(0, Math.round(100 - (inconclusive / Math.max(results.length, 1)) * 40));
  const criticalHardFailure = results.some(
    (result) => result.status !== "pass" && result.objective && result.severity === "critical"
  );
  const failed = results.filter((result) => result.status === "fail" || result.status === "error").length;
  const warnings = results.filter((result) => result.status === "warning").length;
  const skipped = results.filter((result) => result.status === "skipped").length;
  const passed = results.filter((result) => result.status === "pass").length;

  const unavailable = inconclusive > 0 && inconclusive / Math.max(results.length, 1) >= 0.5;
  const verdict: ProofReceipt["verdict"] = unavailable
    ? "inconclusive"
    : criticalHardFailure || completionScore < 50
      ? "reject"
      : failed > 0 || completionScore < 75
        ? "revision_required"
        : completionScore < 90 || warnings > 0
          ? "accept_with_warnings"
          : "accept";

  const recommendedAction: ProofReceipt["recommendedAction"] =
    verdict === "accept"
      ? "release_payment"
      : verdict === "accept_with_warnings"
        ? "release_with_warning"
        : verdict === "revision_required"
          ? "request_revision"
          : verdict === "inconclusive"
            ? "request_more_information"
            : "reject_delivery";

  return { completionScore, confidenceScore, verdict, recommendedAction, passed, failed, warnings, skipped };
}
