import { type NextRequest } from "next/server";
import { POST as postAssistantFeedback } from "@/app/api/assistant/feedback/route";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return postAssistantFeedback(req);
}
