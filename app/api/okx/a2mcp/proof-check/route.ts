import { NextResponse } from "next/server";
import { runProofCheck } from "@/lib/audit";
import { ProofCheckRequestSchema } from "@/lib/domain";
import { createRequestId, errorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const body: unknown = await request.json();
    const input = ProofCheckRequestSchema.parse(body);
    const receipt = await runProofCheck(input, requestId);
    return NextResponse.json({ success: true, requestId, receipt }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proof check failed.";
    const unsafe = /private|localhost|credentials|Only HTTP/u.test(message);
    return errorResponse(
      unsafe ? 400 : 500,
      unsafe ? "UNSAFE_URL" : "INTERNAL_ERROR",
      unsafe ? "OutcomeOS blocked the supplied target for safety." : "OutcomeOS could not complete the proof check.",
      unsafe ? message : "Retry later or inspect the request ID in server logs.",
      requestId
    );
  }
}
