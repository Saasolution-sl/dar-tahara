import Link from "next/link";

/**
 * Global 404 (renders under the passthrough root layout, so it provides its
 * own html/body). Locale-specific 404s live in app/[locale]/not-found.tsx.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#faf8f3",
          color: "#26241f",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          margin: 0,
        }}
      >
        <div style={{ padding: "2rem" }}>
          <p style={{ fontSize: "3rem", fontWeight: 600, margin: 0 }}>404</p>
          <p style={{ color: "#6a5946", marginTop: "0.5rem" }}>This page could not be found.</p>
          <Link
            href="/en"
            style={{
              display: "inline-block",
              marginTop: "1.5rem",
              padding: "0.7rem 1.4rem",
              borderRadius: "999px",
              background: "#2f4a29",
              color: "#faf8f3",
              textDecoration: "none",
            }}
          >
            Return home
          </Link>
        </div>
      </body>
    </html>
  );
}
