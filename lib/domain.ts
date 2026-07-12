import { z } from "zod";

export const SeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export const TaskTypeSchema = z.enum(["website", "repository", "content", "mixed"]);
export const VerificationTypeSchema = z.enum([
  "http_status",
  "https_required",
  "page_contains",
  "link_exists",
  "link_status",
  "meta_present",
  "viewport_present",
  "repository_file_exists",
  "repository_file_contains",
  "package_script_exists",
  "secret_pattern_scan",
  "content_length",
  "content_contains",
  "content_excludes",
  "section_exists",
  "link_validation",
  "semantic_advisory"
]);

export const EvidenceItemSchema = z.object({
  type: z.enum(["http", "html", "repository", "content", "security", "hash", "advisory"]),
  label: z.string().min(1),
  value: z.unknown(),
  redacted: z.boolean().default(false)
});

export const DeliverableSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  source: z.enum(["user", "template", "ai"])
});

export const AcceptanceTestSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  verificationType: VerificationTypeSchema,
  target: z.string().optional(),
  expected: z.unknown().optional(),
  severity: SeveritySchema,
  hardRequirement: z.boolean(),
  source: z.enum(["user", "template", "ai"])
});

export const EvidenceRequirementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  source: z.enum(["user", "template", "ai"])
});

export const RevisionRuleSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  maxRevisionCount: z.number().int().positive().default(2)
});

export const OutcomeContractSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  originalTask: z.string().min(8),
  taskType: TaskTypeSchema,
  contractVersion: z.string().min(1),
  status: z.enum(["draft", "locked"]),
  createdAt: z.string().datetime(),
  lockedAt: z.string().datetime().optional(),
  deliverables: z.array(DeliverableSchema).min(1),
  acceptanceTests: z.array(AcceptanceTestSchema).min(1),
  requiredEvidence: z.array(EvidenceRequirementSchema),
  revisionRules: z.array(RevisionRuleSchema),
  assumptions: z.array(z.string()),
  exclusions: z.array(z.string())
});

export const TestResultSchema = z.object({
  testId: z.string().min(1),
  status: z.enum(["pass", "fail", "warning", "skipped", "error"]),
  objective: z.boolean(),
  severity: SeveritySchema,
  expected: z.unknown(),
  actual: z.unknown(),
  summary: z.string().min(1),
  evidence: z.array(EvidenceItemSchema),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationMs: z.number().nonnegative()
});

export const ProofReceiptSchema = z.object({
  receiptId: z.string().min(1),
  auditId: z.string().min(1),
  contractId: z.string().min(1),
  contractHash: z.string().regex(/^[a-f0-9]{64}$/),
  evidenceHash: z.string().regex(/^[a-f0-9]{64}$/),
  verdict: z.enum(["accept", "accept_with_warnings", "revision_required", "reject", "inconclusive"]),
  recommendedAction: z.enum([
    "release_payment",
    "release_with_warning",
    "request_revision",
    "reject_delivery",
    "prepare_dispute_evidence",
    "request_more_information"
  ]),
  completionScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  passed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  warnings: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  generatedAt: z.string().datetime(),
  results: z.array(TestResultSchema),
  limitations: z.array(z.string())
});

export type Severity = z.infer<typeof SeveritySchema>;
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type Deliverable = z.infer<typeof DeliverableSchema>;
export type AcceptanceTest = z.infer<typeof AcceptanceTestSchema>;
export type EvidenceRequirement = z.infer<typeof EvidenceRequirementSchema>;
export type RevisionRule = z.infer<typeof RevisionRuleSchema>;
export type OutcomeContract = z.infer<typeof OutcomeContractSchema>;
export type TestResult = z.infer<typeof TestResultSchema>;
export type ProofReceipt = z.infer<typeof ProofReceiptSchema>;

export const CompileContractRequestSchema = z.object({
  task: z.string().min(8).max(8_000),
  taskType: TaskTypeSchema,
  requiredFeatures: z.array(z.string().min(1).max(300)).max(20).default([])
});

export const ProofCheckRequestSchema = z.object({
  contract: OutcomeContractSchema,
  targetType: TaskTypeSchema,
  target: z.string().min(1).max(20_000)
});

export type CompileContractRequest = z.infer<typeof CompileContractRequestSchema>;
export type ProofCheckRequest = z.infer<typeof ProofCheckRequestSchema>;
