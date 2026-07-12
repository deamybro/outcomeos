import { NextResponse } from "next/server";

export type ErrorCode =
  | "INVALID_REQUEST"
  | "UNSUPPORTED_TARGET"
  | "UNSAFE_URL"
  | "TARGET_UNREACHABLE"
  | "TARGET_TOO_LARGE"
  | "GITHUB_RATE_LIMITED"
  | "GITHUB_REPOSITORY_NOT_FOUND"
  | "AI_UNAVAILABLE"
  | "AI_RESPONSE_INVALID"
  | "AUDIT_TIMEOUT"
  | "RATE_LIMITED"
  | "DATABASE_UNAVAILABLE"
  | "RECEIPT_NOT_FOUND"
  | "INTERNAL_ERROR";

export type PublicError = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    action: string;
    requestId: string;
  };
};

export function createRequestId(prefix = "req"): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
}

export function errorResponse(
  status: number,
  code: ErrorCode,
  message: string,
  action: string,
  requestId: string
) {
  return NextResponse.json<PublicError>(
    { success: false, error: { code, message, action, requestId } },
    { status, headers: { "x-request-id": requestId } }
  );
}
