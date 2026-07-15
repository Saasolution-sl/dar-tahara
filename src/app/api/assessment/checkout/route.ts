import { NextRequest, NextResponse } from "next/server";
import { createAssessmentCheckout } from "@/lib/assessment-checkout";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const result = await createAssessmentCheckout(await req.json().catch(() => null), req);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ checkoutUrl: result.checkoutUrl, reference: result.reference });
}
