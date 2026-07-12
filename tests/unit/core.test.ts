import { describe, expect, it } from "vitest";
import { OutcomeContractSchema } from "@/lib/domain";
import { canonicalize } from "@/lib/hashing/canonical";
import { hashCanonicalJson } from "@/lib/hashing/sha256";
import { isUnsafeIp } from "@/lib/security/url";
import { redactSecretPreview, scanTextForSecrets } from "@/lib/security/secrets";
import { scoreResults } from "@/lib/scoring/verdict";
import { redactPublicValue } from "@/lib/receipts";
import type { TestResult } from "@/lib/domain";

const result = (status: TestResult["status"], severity: TestResult["severity"] = "high"): TestResult => ({testId:crypto.randomUUID(),status,objective:true,severity,expected:true,actual:status==="pass",summary:"controlled test",evidence:[],startedAt:new Date().toISOString(),completedAt:new Date().toISOString(),durationMs:1});

describe("canonical evidence", () => {
  it("orders object keys and hashes deterministically", () => { expect(canonicalize({b:2,a:1})).toBe('{"a":1,"b":2}'); expect(hashCanonicalJson({b:2,a:1})).toMatch(/^[a-f0-9]{64}$/); expect(hashCanonicalJson({b:2,a:1})).toBe(hashCanonicalJson({a:1,b:2})); });
});

describe("security", () => {
  it.each(["127.0.0.1","10.1.2.3","172.16.0.1","192.168.1.1","169.254.4.2","::1","fd00::1","fe80::1"])("blocks %s", (ip) => expect(isUnsafeIp(ip)).toBe(true));
  it("allows a public IP", () => expect(isUnsafeIp("1.1.1.1")).toBe(false));
  it("redacts findings", () => { const findings=scanTextForSecrets("fixture.txt",'api_key="EXAMPLE_NOT_REAL_1234567890"'); expect(findings[0]?.preview).toContain("[redacted]"); expect(redactSecretPreview("short")).toBe("[redacted]"); });
  it("redacts public emails and tokens", () => expect(JSON.stringify(redactPublicValue({email:"a@example.com",token:"secret-value"}))).not.toContain("example.com"));
});

describe("scoring", () => {
  it("accepts a clean delivery", () => expect(scoreResults([result("pass","critical"),result("pass")]).verdict).toBe("accept"));
  it("rejects a critical failure", () => expect(scoreResults([result("fail","critical"),result("pass","low")]).verdict).toBe("reject"));
  it("is inconclusive when most tests cannot run", () => expect(scoreResults([result("error"),result("skipped"),result("pass")]).verdict).toBe("inconclusive"));
});

describe("schemas", () => {
  it("rejects a locked contract without required fields", () => expect(() => OutcomeContractSchema.parse({status:"locked"})).toThrow());
});
