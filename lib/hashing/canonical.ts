export type CanonicalJson =
  | null
  | boolean
  | number
  | string
  | CanonicalJson[]
  | { readonly [key: string]: CanonicalJson };

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function canonicalize(value: unknown): string {
  return JSON.stringify(normalize(value));
}

function normalize(value: unknown): CanonicalJson {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Cannot canonicalize non-finite number");
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => normalize(item));
  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, CanonicalJson>>((acc, key) => {
        const item = value[key];
        if (item !== undefined) acc[key] = normalize(item);
        return acc;
      }, {});
  }
  throw new Error(`Unsupported canonical JSON value: ${typeof value}`);
}
