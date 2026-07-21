import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0a84ff 0%, #0056d6 100%)",
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 20,
            background: "rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.35)",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "18px solid transparent",
              borderRight: "18px solid transparent",
              borderTop: "30px solid #ffffff",
              marginTop: 6,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
