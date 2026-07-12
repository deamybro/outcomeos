import { NextResponse } from "next/server";
import { compileOutcomeContract } from "@/lib/compiler";
import { CompileContractRequestSchema } from "@/lib/domain";
import { createRequestId, errorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const body: unknown = await request.json();
    const input = CompileContractRequestSchema.parse(body);
    const contract = await compileOutcomeContract(input);
    return NextResponse.json({ success: true, requestId, contract }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request could not be parsed.";
    return errorResponse(400, "INVALID_REQUEST", message, "Check the task, taskType and requiredFeatures fields.", requestId);
  }
}
