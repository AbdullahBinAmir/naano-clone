"use client";

// Rendered only when the root layout itself fails, so it can't rely on the
// app's fonts, tokens or components — plain inline styles keep it dependable.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ maxWidth: 420, textAlign: "center", background: "#141416", borderRadius: 24, padding: 28 }}>
            <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
            <p style={{ color: "#8A8A93", fontSize: 14 }}>Please try again.</p>
            <button
              onClick={reset}
              style={{ marginTop: 16, background: "#9B5CF6", color: "#fff", border: 0, borderRadius: 16, padding: "10px 20px", fontSize: 16, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
