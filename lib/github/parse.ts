export function parseGithubRepository(input: string): { owner: string; repo: string } {
  const trimmed = input.trim();
  const url = trimmed.startsWith("http") ? new URL(trimmed) : undefined;
  const path = url ? url.pathname : trimmed;
  const [owner, repoWithSuffix] = path.replace(/^\/+/u, "").split("/");
  const repo = repoWithSuffix?.replace(/\.git$/u, "");
  if (!owner || !repo || url?.hostname !== undefined && !["github.com", "www.github.com"].includes(url.hostname)) {
    throw new Error("Expected a public GitHub repository URL or owner/repo.");
  }
  return { owner, repo };
}
