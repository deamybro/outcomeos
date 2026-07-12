import { NextResponse } from "next/server";
import { ProofReceiptSchema } from "@/lib/domain";
import { receiptToMarkdown } from "@/lib/receipts";
import { createRequestId, errorResponse } from "@/lib/errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const body: unknown = await request.json();
    const receipt = ProofReceiptSchema.parse(body);
    return NextResponse.json({
      success: true,
      requestId,
      downloads: {
        json: receipt,
        markdown: receiptToMarkdown(receipt)
      }
    });
  } catch (error) {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      error instanceof Error ? error.message : "Invalid receipt payload.",
      "Send a valid ProofReceipt JSON document.",
      requestId
    );
  }
}
