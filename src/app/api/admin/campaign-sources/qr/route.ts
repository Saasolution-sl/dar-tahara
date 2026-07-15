import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAdminAuthorized, adminConfigured } from "@/lib/admin-auth";

export const runtime = "nodejs";

/**
 * Render a QR code (SVG) for a given URL. Admin only. SVG so it scales crisply
 * for print (flyers, events) and downloads as a small vector file. The URL must
 * be an https dartahara.com link — we don't render QR for arbitrary input.
 */
export async function GET(req: NextRequest) {
  if (!adminConfigured() || !isAdminAuthorized(req)) {
    return new NextResponse("unauthorized", { status: 401 });
  }
  const url = req.nextUrl.searchParams.get("url") ?? "";
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }
  if (parsed.protocol !== "https:" || !/(^|\.)dartahara\.com$/.test(parsed.hostname)) {
    return new NextResponse("url not allowed", { status: 400 });
  }

  try {
    const svg = await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: { dark: "#2f4a29", light: "#ffffff" },
      width: 320,
    });
    const download = req.nextUrl.searchParams.get("download") === "1";
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store",
        ...(download ? { "Content-Disposition": 'attachment; filename="dar-tahara-qr.svg"' } : {}),
      },
    });
  } catch {
    return new NextResponse("qr error", { status: 500 });
  }
}
