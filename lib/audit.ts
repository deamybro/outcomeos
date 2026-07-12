import type { OutcomeContract, ProofReceipt, ProofCheckRequest, TestResult } from "@/lib/domain";
import { createProofReceipt } from "@/lib/receipts";
import { ContentVerifier } from "@/lib/verification/content/verifier";
import { runVerification } from "@/lib/verification/engine";
import { RepositoryVerifier, type RepositoryInput } from "@/lib/verification/repository/verifier";
import type { VerificationContext, Verifier } from "@/lib/verification/types";
import { WebsiteVerifier, type WebsiteInput } from "@/lib/verification/website/verifier";

export async function runProofCheck(request: ProofCheckRequest, requestId: string): Promise<ProofReceipt> {
  const context: VerificationContext = {
    requestId,
    startedAt: new Date().toISOString(),
    timeoutMs: 8_000
  };
  const results = await runForTarget(request.contract, request.targetType, request.target, context);
  return createProofReceipt(request.contract, results);
}

async function runForTarget(
  contract: OutcomeContract,
  targetType: ProofCheckRequest["targetType"],
  target: string,
  context: VerificationContext
): Promise<TestResult[]> {
  if (targetType === "website") {
    return runVerification(contract.acceptanceTests, { url: target }, [new WebsiteVerifier()] satisfies Verifier<WebsiteInput>[], context);
  }
  if (targetType === "repository") {
    return runVerification(contract.acceptanceTests, { repository: target }, [new RepositoryVerifier()] satisfies Verifier<RepositoryInput>[], context);
  }
  if (targetType === "content") {
    return runVerification(contract.acceptanceTests, target, [new ContentVerifier()] satisfies Verifier<string>[], context);
  }
  const websiteResults = await runVerification(contract.acceptanceTests, { url: target }, [new WebsiteVerifier()] satisfies Verifier<WebsiteInput>[], context);
  return websiteResults;
}
