interface BrandMarkProps {
  variant?: "light" | "dark";
}

export function BrandMark({ variant = "light" }: BrandMarkProps) {
  const isDark = variant === "dark";
  const tileBg = isDark ? "#FFFFFF" : "#111111";
  const barFill = isDark ? "#111111" : "#FFFFFF";
  const wordmarkColor = isDark ? "text-white" : "text-[#14181f]";

  return (
    <span className={`inline-flex items-center gap-2.5 ${wordmarkColor}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="5" fill={tileBg} />
        <rect x="7" y="9" width="14" height="5" rx="1" fill={barFill} />
        <rect x="11" y="18" width="14" height="5" rx="1" fill={barFill} />
      </svg>
      <span className="font-mono text-[15px] font-semibold tracking-[0.22em]">
        STAK
      </span>
    </span>
  );
}
