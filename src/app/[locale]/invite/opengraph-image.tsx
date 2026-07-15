import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { campaignCopy } from "@/i18n/campaign-copy";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dar Tahara early access";

export default function OpengraphImage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const copy = campaignCopy[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 78px",
          background: "linear-gradient(135deg, #faf8f3 0%, #f3efe6 48%, #dfe9dc 100%)",
          color: "#26241f",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 430, height: 430, borderRadius: 999, border: "2px solid rgba(47,74,41,.12)", right: -100, top: -170 }} />
        <div style={{ position: "absolute", width: 280, height: 280, borderRadius: 999, background: "rgba(207,162,75,.12)", right: -20, bottom: -140 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: "#2f4a29", color: "#cfa24b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>⌂</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 29, fontWeight: 700, color: "#2f4a29" }}>Dar Tahara</span>
              <span style={{ fontSize: 13, letterSpacing: 4, color: "#a5722d", textTransform: "uppercase" }}>House of Purity</span>
            </div>
          </div>
          <span style={{ padding: "12px 20px", borderRadius: 999, background: "rgba(47,74,41,.09)", color: "#2f4a29", fontSize: 15, fontWeight: 600 }}>{copy.eyebrow}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900 }}>
          <span style={{ fontSize: 58, lineHeight: 1.08, fontWeight: 650, letterSpacing: -1.5 }}>{copy.title}</span>
          <span style={{ fontSize: 23, lineHeight: 1.4, color: "#6a5946", maxWidth: 820 }}>{copy.metaDescription}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, color: "#2f4a29", fontWeight: 600 }}>
          <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 999, background: "#cfa24b", color: "#26241f", fontSize: 16 }}>✓</span>
          {copy.formCta}
        </div>
      </div>
    ),
    { ...size },
  );
}
