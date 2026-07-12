import { z } from "zod";

export const AiSuggestionSchema = z
  .object({
    deliverables: z.array(z.string().min(1)).default([]),
    acceptanceTests: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          verificationType: z.enum([
            "page_contains",
            "link_exists",
            "repository_file_exists",
            "repository_file_contains",
            "package_script_exists",
            "content_length",
            "content_contains",
            "content_excludes",
            "section_exists",
            "semantic_advisory"
          ]),
          expected: z.unknown().optional(),
          severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
          hardRequirement: z.boolean().default(false)
        })
      )
      .default([]),
    assumptions: z.array(z.string().min(1)).default([]),
    exclusions: z.array(z.string().min(1)).default([]),
    requiredEvidence: z.array(z.string().min(1)).default([])
  })
  .strict();

export type AiSuggestion = z.infer<typeof AiSuggestionSchema>;

export interface AiProvider {
  expandContract(task: string, taskType: string, requiredFeatures: string[]): Promise<AiSuggestion>;
}

export class DeterministicAiFallback implements AiProvider {
  async expandContract(): Promise<AiSuggestion> {
    return { deliverables: [], acceptanceTests: [], assumptions: [], exclusions: [], requiredEvidence: [] };
  }
}

export function createAiProvider(): AiProvider {
  if (!process.env.GEMINI_API_KEY) return new DeterministicAiFallback();
  return new GeminiProvider(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL ?? "gemini-2.5-flash");
}

class GeminiProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async expandContract(task: string, taskType: string, requiredFeatures: string[]): Promise<AiSuggestion> {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      const response = await ai.models.generateContent({
        model: this.model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Return strict JSON only. Suggest measurable acceptance criteria for OutcomeOS without inventing promises. " +
                  `Task type: ${taskType}. Task: ${task}. Required features: ${requiredFeatures.join(", ")}`
              }
            ]
          }
        ]
      });
      const text = response.text ?? "{}";
      const parsed: unknown = JSON.parse(text.replace(/^```json\s*/u, "").replace(/```$/u, ""));
      return AiSuggestionSchema.parse(parsed);
    } catch {
      return new DeterministicAiFallback().expandContract();
    }
  }
}
