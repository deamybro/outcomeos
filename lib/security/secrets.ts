export type SecretFinding = {
  file: string;
  line: number;
  pattern: string;
  preview: string;
};

const patterns: Array<{ name: string; regex: RegExp }> = [
  { name: "private_key", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/u },
  { name: "generic_api_key", regex: /(api[_-]?key|secret|token)\s*[:=]\s*["']?[A-Za-z0-9_\-.]{20,}/iu },
  { name: "aws_access_key", regex: /AKIA[0-9A-Z]{16}/u }
];

export function scanTextForSecrets(file: string, text: string): SecretFinding[] {
  return text.split(/\r?\n/u).flatMap((line, index) =>
    patterns
      .filter((pattern) => pattern.regex.test(line))
      .map((pattern) => ({
        file,
        line: index + 1,
        pattern: pattern.name,
        preview: redactSecretPreview(line)
      }))
  );
}

export function redactSecretPreview(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 12) return "[redacted]";
  return `${trimmed.slice(0, 6)}...[redacted]...${trimmed.slice(-4)}`;
}
