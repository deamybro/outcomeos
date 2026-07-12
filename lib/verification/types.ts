import type { AcceptanceTest, TestResult } from "@/lib/domain";

export type VerificationContext = {
  requestId: string;
  startedAt: string;
  timeoutMs: number;
};

export interface Verifier<TInput> {
  supports(test: AcceptanceTest): boolean;
  execute(test: AcceptanceTest, input: TInput, context: VerificationContext): Promise<TestResult>;
}

export function makeResult(
  test: AcceptanceTest,
  startedAt: string,
  status: TestResult["status"],
  actual: unknown,
  summary: string,
  evidence: TestResult["evidence"] = [],
  objective = test.verificationType !== "semantic_advisory"
): TestResult {
  const completedAt = new Date().toISOString();
  return {
    testId: test.id,
    status,
    objective,
    severity: test.severity,
    expected: test.expected ?? null,
    actual,
    summary,
    evidence,
    startedAt,
    completedAt,
    durationMs: new Date(completedAt).getTime() - new Date(startedAt).getTime()
  };
}
