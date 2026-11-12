import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "24px",
          backgroundColor: "#111111",
          borderRadius: "32px",
          padding: "38px",
        }}
      >
        <div
          style={{
            width: "78px",
            height: "28px",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            alignSelf: "flex-start",
          }}
        />
        <div
          style={{
            width: "78px",
            height: "28px",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            alignSelf: "flex-end",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
