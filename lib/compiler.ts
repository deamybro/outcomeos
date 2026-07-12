import type { AcceptanceTest, CompileContractRequest, Deliverable, OutcomeContract } from "@/lib/domain";
import { createAiProvider } from "@/lib/ai/provider";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;

export async function compileOutcomeContract(input: CompileContractRequest): Promise<OutcomeContract> {
  const deterministic = templateFor(input);
  const ai = await createAiProvider().expandContract(input.task, input.taskType, input.requiredFeatures);
  const aiTests: AcceptanceTest[] = ai.acceptanceTests.slice(0, 8).map((test) => ({
    id: id("test_ai"),
    title: test.title,
    description: test.description,
    verificationType: test.verificationType,
    expected: test.expected,
    severity: test.severity,
    hardRequirement: test.hardRequirement,
    source: "ai"
  }));
  const aiDeliverables: Deliverable[] = ai.deliverables.slice(0, 6).map((title) => ({
    id: id("del_ai"),
    title,
    description: "AI-suggested deliverable. Review before locking.",
    source: "ai"
  }));

  return {
    id: id("contract"),
    title: titleFor(input.task),
    originalTask: input.task,
    taskType: input.taskType,
    contractVersion: "1.0.0",
    status: "draft",
    createdAt: now(),
    deliverables: [...deterministic.deliverables, ...aiDeliverables],
    acceptanceTests: [...deterministic.acceptanceTests, ...aiTests],
    requiredEvidence: [
      ...deterministic.requiredEvidence,
      ...ai.requiredEvidence.slice(0, 6).map((title) => ({
        id: id("ev_ai"),
        title,
        description: "AI-suggested evidence requirement. Review before locking.",
        source: "ai" as const
      }))
    ],
    revisionRules: [
      {
        id: id("rev"),
        description: "Critical or high failed hard requirements require revision before acceptance.",
        maxRevisionCount: 2
      }
    ],
    assumptions: [
      "Checks are limited to public, unauthenticated targets.",
      "AI advisory findings cannot override failed deterministic hard requirements.",
      ...ai.assumptions.slice(0, 6)
    ],
    exclusions: [
      "OutcomeOS does not execute arbitrary repository code in the web application.",
      "Evidence hashes are SHA-256 hashes ready for future anchoring; they are not onchain transactions.",
      ...ai.exclusions.slice(0, 6)
    ]
  };
}

function titleFor(task: string): string {
  const trimmed = task.replace(/\s+/g, " ").trim();
  return trimmed.length > 72 ? `${trimmed.slice(0, 69)}...` : trimmed;
}

function templateFor(input: CompileContractRequest) {
  const deliverables: Deliverable[] = [
    {
      id: id("del"),
      title: "Submitted delivery matches the requested task",
      description: input.task,
      source: "user"
    }
  ];
  const acceptanceTests: AcceptanceTest[] = [];

  for (const feature of input.requiredFeatures) {
    acceptanceTests.push({
      id: id("test_feature"),
      title: `Required feature: ${feature}`,
      description: `The delivery must include ${feature}.`,
      verificationType:
        input.taskType === "repository"
          ? "repository_file_contains"
          : input.taskType === "content"
            ? "content_contains"
            : "page_contains",
      expected: feature,
      severity: "high",
      hardRequirement: true,
      source: "user"
    });
  }

  if (input.taskType === "website" || input.taskType === "mixed") {
    acceptanceTests.push(
      {
        id: id("test"),
        title: "Website returns a successful response",
        description: "The submitted website URL must respond with HTTP 200.",
        verificationType: "http_status",
        expected: 200,
        severity: "critical",
        hardRequirement: true,
        source: "template"
      },
      {
        id: id("test"),
        title: "Mobile viewport is present",
        description: "The page must include a mobile viewport meta tag.",
        verificationType: "viewport_present",
        expected: true,
        severity: "high",
        hardRequirement: true,
        source: "template"
      },
      {
        id: id("test"),
        title: "Meta description is present",
        description: "The page must include a meta description.",
        verificationType: "meta_present",
        expected: "description",
        severity: "medium",
        hardRequirement: false,
        source: "template"
      }
    );
  }

  if (input.taskType === "repository" || input.taskType === "mixed") {
    acceptanceTests.push(
      {
        id: id("test"),
        title: "README exists",
        description: "Repository must contain a README.",
        verificationType: "repository_file_exists",
        target: "README.md",
        expected: true,
        severity: "high",
        hardRequirement: true,
        source: "template"
      },
      {
        id: id("test"),
        title: "Build script exists",
        description: "package.json should expose a build script when applicable.",
        verificationType: "package_script_exists",
        expected: "build",
        severity: "high",
        hardRequirement: true,
        source: "template"
      },
      {
        id: id("test"),
        title: "No obvious secrets",
        description: "Static secret-pattern scan must not find high-risk credentials.",
        verificationType: "secret_pattern_scan",
        expected: "no high-risk secret patterns",
        severity: "critical",
        hardRequirement: true,
        source: "template"
      }
    );
  }

  if (input.taskType === "content") {
    acceptanceTests.push(
      {
        id: id("test"),
        title: "Minimum useful length",
        description: "Content should contain at least 80 words.",
        verificationType: "content_length",
        expected: { minWords: 80 },
        severity: "medium",
        hardRequirement: false,
        source: "template"
      },
      {
        id: id("test"),
        title: "No placeholder text",
        description: "Content must not contain obvious placeholders.",
        verificationType: "content_excludes",
        expected: ["lorem ipsum", "todo", "placeholder"],
        severity: "high",
        hardRequirement: true,
        source: "template"
      }
    );
  }

  return {
    deliverables,
    acceptanceTests,
    requiredEvidence: [
      {
        id: id("ev"),
        title: "Objective check results",
        description: "Machine-readable evidence from deterministic checks.",
        source: "template" as const
      },
      {
        id: id("ev"),
        title: "Tamper-evident receipt hash",
        description: "Canonical SHA-256 hash over receipt evidence.",
        source: "template" as const
      }
    ]
  };
}
