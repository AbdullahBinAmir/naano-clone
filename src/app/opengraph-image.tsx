import { ImageResponse } from "next/og";

export const alt = "Naano — find LinkedIn creators your buyers already trust";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default social preview: the landing hero's gradient and headline.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(150deg, #EAD9B4 0%, #C4A6EE 24%, #8A5BE0 50%, #4A2A98 74%, #0C0818 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, color: "#1A1A1A", fontWeight: 600 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#0D0D12",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            N
          </div>
          naano
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.07, fontWeight: 600 }}>
          <span style={{ color: "#1A1A1A" }}>Find the LinkedIn voices</span>
          <span style={{ color: "#1A1A1A" }}>your buyers already trust —</span>
          <span style={{ color: "#fff" }}>booked in one click.</span>
        </div>
      </div>
    ),
    size,
  );
}
