import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dar Tahara — House of Purity";

/** Dynamically rendered Open Graph card, brand-styled and localized. */
export default async function OpengraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : "en";
  const dict = await getDictionary(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #24401f 0%, #2f4a29 55%, #1f331b 100%)",
          color: "#faf8f3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              border: "3px solid #cfa24b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              color: "#cfa24b",
            }}
          >
            ⌂
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 700 }}>Dar Tahara</span>
            <span style={{ fontSize: 16, letterSpacing: 4, color: "#cfa24b", textTransform: "uppercase" }}>
              House of Purity
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontSize: 15, letterSpacing: 6, color: "#e6cf9c", textTransform: "uppercase" }}>
            {dict.hero.eyebrow}
          </span>
          <span style={{ fontSize: 60, lineHeight: 1.1, fontWeight: 600, maxWidth: 900 }}>
            {dict.brand.tagline}
          </span>
        </div>

        <span style={{ fontSize: 22, color: "rgba(250,248,243,0.75)" }}>
          Premium home care & property concierge · Morocco
        </span>
      </div>
    ),
    { ...size },
  );
}
