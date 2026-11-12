import { SITE_CONFIG } from "@/lib/site";

export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#14181f",
        color: "#fbfbfa",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "6px",
            padding: "10px",
          }}
        >
          <div
            style={{
              width: "21px",
              height: "7px",
              borderRadius: "2px",
              backgroundColor: "#111111",
              alignSelf: "flex-start",
            }}
          />
          <div
            style={{
              width: "21px",
              height: "7px",
              borderRadius: "2px",
              backgroundColor: "#111111",
              alignSelf: "flex-end",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "26px",
            fontWeight: 600,
            letterSpacing: "0.22em",
            fontFamily: "monospace",
          }}
        >
          STAK
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: "62px",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: "980px",
          }}
        >
          {SITE_CONFIG.title}
        </div>
        <div
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            lineHeight: 1.4,
            maxWidth: "900px",
          }}
        >
          Research markets, create brand-aligned content, improve SEO/AEO/GEO
          visibility, and manage AI-search workflows.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #2c3440",
          paddingTop: "28px",
          fontSize: "22px",
          color: "#cbd5e1",
        }}
      >
        <span>{SITE_CONFIG.domain}</span>
        <span>$129 / month</span>
      </div>
    </div>
  );
}
