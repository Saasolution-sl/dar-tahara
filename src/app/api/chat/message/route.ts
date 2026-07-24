import { type NextRequest } from "next/server";
import { POST as postAssistantMessage } from "@/app/api/assistant/chat/route";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return postAssistantMessage(req);
}
