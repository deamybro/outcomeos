import type { AcceptanceTest, TestResult } from "@/lib/domain";
import type { VerificationContext, Verifier } from "./types";
import { makeResult } from "./types";

export async function runVerification<TInput>(
  tests: AcceptanceTest[],
  input: TInput,
  verifiers: Verifier<TInput>[],
  context: VerificationContext
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (const test of tests) {
    const verifier = verifiers.find((candidate) => candidate.supports(test));
    if (!verifier) {
      results.push(makeResult(test, new Date().toISOString(), "skipped", null, "No verifier supports this test."));
      continue;
    }
    const startedAt = new Date().toISOString();
    try {
      results.push(await verifier.execute(test, input, context));
    } catch (error) {
      results.push(
        makeResult(
          test,
          startedAt,
          "error",
          error instanceof Error ? error.message : "Unknown verification error",
          "The verifier errored. OutcomeOS never converts verifier errors into passing tests."
        )
      );
    }
  }
  return results;
}
