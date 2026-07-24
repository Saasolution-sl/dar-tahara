import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[#faf8f3] text-center text-[#26241f]"
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
    </main>
  );
}
