import { Octokit } from "@octokit/rest";
import type { AcceptanceTest } from "@/lib/domain";
import { parseGithubRepository } from "@/lib/github/parse";
import { scanTextForSecrets } from "@/lib/security/secrets";
import type { Verifier } from "@/lib/verification/types";
import { makeResult } from "@/lib/verification/types";

export type RepositoryInput = {
  repository: string;
};

const supported = new Set<AcceptanceTest["verificationType"]>([
  "repository_file_exists",
  "repository_file_contains",
  "package_script_exists",
  "secret_pattern_scan"
]);

export class RepositoryVerifier implements Verifier<RepositoryInput> {
  private readonly octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

  supports(test: AcceptanceTest): boolean {
    return supported.has(test.verificationType);
  }

  async execute(test: AcceptanceTest, input: RepositoryInput) {
    const startedAt = new Date().toISOString();
    const repo = parseGithubRepository(input.repository);
    if (test.verificationType === "repository_file_exists") {
      const path = String(test.target ?? test.expected ?? "");
      const content = await this.getTextFile(repo, path);
      const ok = content !== undefined;
      return makeResult(test, startedAt, ok ? "pass" : "fail", { path, exists: ok }, `${path} ${ok ? "exists" : "is missing"}.`);
    }
    if (test.verificationType === "repository_file_contains") {
      const path = test.target ?? "README.md";
      const expected = String(test.expected ?? "");
      const content = await this.getTextFile(repo, path);
      const ok = content?.toLowerCase().includes(expected.toLowerCase()) ?? false;
      return makeResult(test, startedAt, ok ? "pass" : "fail", { path, contains: ok }, `${path} ${ok ? "contains" : "does not contain"} "${expected}".`);
    }
    if (test.verificationType === "package_script_exists") {
      const scriptName = String(test.expected ?? "build");
      const content = await this.getTextFile(repo, "package.json");
      const parsed = content ? readPackageJson(content) : undefined;
      const ok = Boolean(parsed?.scripts?.[scriptName]);
      return makeResult(test, startedAt, ok ? "pass" : "fail", { scriptName, present: ok }, `package.json script "${scriptName}" ${ok ? "exists" : "is missing"}.`);
    }
    const files = await Promise.all([".env", ".env.example", "README.md", "package.json"].map((path) => this.getTextFile(repo, path).then((content) => ({ path, content }))));
    const findings = files.flatMap((file) => (file.content ? scanTextForSecrets(file.path, file.content) : []));
    return makeResult(
      test,
      startedAt,
      findings.length === 0 ? "pass" : "fail",
      { findings },
      findings.length === 0 ? "No high-risk secret patterns found in sampled files." : "Potential secret patterns found. Values are redacted."
    );
  }

  private async getTextFile(repo: { owner: string; repo: string }, path: string): Promise<string | undefined> {
    try {
      const response = await this.octokit.repos.getContent({ ...repo, path });
      if (Array.isArray(response.data) || response.data.type !== "file" || !("content" in response.data)) return undefined;
      return Buffer.from(response.data.content, "base64").toString("utf8");
    } catch (error) {
      const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
      if (status === 404) return undefined;
      throw error;
    }
  }
}

function readPackageJson(content: string): { scripts?: Record<string, string> } | undefined {
  try {
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed !== "object" || parsed === null) return undefined;
    const candidate = parsed as { scripts?: unknown };
    if (typeof candidate.scripts !== "object" || candidate.scripts === null) return {};
    return { scripts: candidate.scripts as Record<string, string> };
  } catch {
    return undefined;
  }
}
