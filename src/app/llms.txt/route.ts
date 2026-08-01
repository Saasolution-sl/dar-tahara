import { buildLlmsText } from "@/lib/llms";

export function GET() {
  return new Response(buildLlmsText(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
