import { ImageResponse } from "next/og";

export const alt = "Zenturo Travel – Antalya VIP Transfer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            Z
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
            Zenturo Travel
          </div>
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          Antalya VIP Transfer
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Airport → Hotel • 24/7 • Fixed Price • Flight Tracking
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
          }}
        >
          {["Belek", "Lara", "Kemer", "Side", "Alanya"].map((d) => (
            <div
              key={d}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: 16,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
