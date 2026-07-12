import { createHash } from "node:crypto";
import { canonicalize } from "./canonical";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function hashCanonicalJson(value: unknown): string {
  return sha256Hex(canonicalize(value));
}
