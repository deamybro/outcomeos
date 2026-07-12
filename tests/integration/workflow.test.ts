import { describe, expect, it } from "vitest";
import { compileOutcomeContract } from "@/lib/compiler";
import { runProofCheck } from "@/lib/audit";
import { verifyReceiptIntegrity } from "@/lib/receipts";

describe("guest content workflow", () => {
  it("compiles, locks, verifies and hashes real deterministic results", async () => {
    const draft=await compileOutcomeContract({task:"Write a detailed OKX.AI launch announcement for OutcomeOS",taskType:"content",requiredFeatures:["#OKXAI"]});
    const contract={...draft,status:"locked" as const,lockedAt:new Date().toISOString()};
    const receipt=await runProofCheck({contract,targetType:"content",target:"Demo data. "+("OutcomeOS verifies delivery evidence for agent commerce. ".repeat(18))+" #OKXAI"},"req_test");
    expect(receipt.results.length).toBeGreaterThan(0); expect(receipt.evidenceHash).toMatch(/^[a-f0-9]{64}$/); expect(verifyReceiptIntegrity(receipt)).toBe(true);
  });
});
