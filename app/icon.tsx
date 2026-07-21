import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 112,
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 56,
            background: "rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid rgba(255,255,255,0.35)",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "52px solid transparent",
              borderRight: "52px solid transparent",
              borderTop: "88px solid #ffffff",
              marginTop: 18,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
