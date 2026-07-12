import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    success: true,
    service: "OutcomeOS",
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: process.env.PAYMENT_MODE ?? "free",
    x402: process.env.ENABLE_X402 === "true" ? "configured_disabled_until_activation" : "disabled",
    gemini: process.env.GEMINI_API_KEY ? "configured" : "fallback",
    github: process.env.GITHUB_TOKEN ? "configured" : "unauthenticated"
  });
}
